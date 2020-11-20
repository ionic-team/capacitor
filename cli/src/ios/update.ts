import { copy, remove, readFile, realpath, writeFile } from '@ionic/utils-fs';
import { basename, dirname, join, relative, resolve } from 'path';

import c from '../colors';
import { checkPlatformVersions, runTask } from '../common';
import {
  checkPluginDependencies,
  handleCordovaPluginsJS,
  logCordovaManualSteps,
} from '../cordova';
import type { Config } from '../definitions';
import { logFatal } from '../log';
import type { Plugin } from '../plugin';
import {
  PluginType,
  getAllElements,
  getFilePath,
  getPlatformElement,
  getPluginType,
  getPlugins,
  printPlugins,
} from '../plugin';
import { convertToUnixPath } from '../util/fs';
import { resolveNode } from '../util/node';
import { runCommand } from '../util/subprocess';

import { getIOSPlugins } from './common';

const platform = 'ios';

export async function updateIOS(
  config: Config,
  deployment: boolean,
): Promise<void> {
  const plugins = await getPluginsTask(config);

  const capacitorPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Core,
  );

  printPlugins(capacitorPlugins, 'ios');

  await removePluginsNativeFiles(config);
  const cordovaPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Cordova,
  );
  if (cordovaPlugins.length > 0) {
    await copyPluginsNativeFiles(config, cordovaPlugins);
  }
  await handleCordovaPluginsJS(cordovaPlugins, config, platform);
  await checkPluginDependencies(plugins, platform);
  await generateCordovaPodspecs(cordovaPlugins, config);
  await installCocoaPodsPlugins(config, plugins, deployment);
  await logCordovaManualSteps(cordovaPlugins, config, platform);

  const incompatibleCordovaPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Incompatible,
  );
  printPlugins(incompatibleCordovaPlugins, platform, 'incompatible');
  await checkPlatformVersions(config, platform);
}

export async function installCocoaPodsPlugins(
  config: Config,
  plugins: Plugin[],
  deployment: boolean,
): Promise<void> {
  await runTask(
    `Updating iOS native dependencies with ${c.input(
      `${config.ios.podPath} install`,
    )}`,
    () => {
      return updatePodfile(config, plugins, deployment);
    },
  );
}

async function updatePodfile(
  config: Config,
  plugins: Plugin[],
  deployment: boolean,
): Promise<void> {
  const dependenciesContent = await generatePodFile(config, plugins);
  const podfilePath = join(config.ios.nativeProjectDirAbs, 'Podfile');
  const podfileLockPath = join(config.ios.nativeProjectDirAbs, 'Podfile.lock');
  let podfileContent = await readFile(podfilePath, { encoding: 'utf-8' });
  podfileContent = podfileContent.replace(
    /(def capacitor_pods)[\s\S]+?(\nend)/,
    `$1${dependenciesContent}$2`,
  );
  podfileContent = podfileContent.replace(
    /platform :ios, '[^']*'/,
    `platform :ios, '${config.ios.minVersion}'`,
  );
  await writeFile(podfilePath, podfileContent, { encoding: 'utf-8' });
  if (!deployment) {
    await remove(podfileLockPath);
  }

  await runCommand(
    config.ios.podPath,
    ['install', ...(deployment ? ['--deployment'] : [])],
    { cwd: config.ios.nativeProjectDirAbs },
  );

  await runCommand(
    'xcodebuild',
    [
      '-project',
      basename(`${config.ios.nativeTargetDirAbs}.xcodeproj`),
      'clean',
    ],
    {
      cwd: config.ios.nativeProjectDirAbs,
    },
  );
}

async function generatePodFile(
  config: Config,
  plugins: Plugin[],
): Promise<string> {
  const capacitoriOSPath = resolveNode(
    config.app.rootDir,
    '@capacitor/ios',
    'package.json',
  );
  if (!capacitoriOSPath) {
    logFatal(
      `Unable to find node_modules/@capacitor/ios.\n` +
        `Are you sure ${c.strong('@capacitor/ios')} is installed?`,
    );
  }

  const podfilePath = config.ios.nativeProjectDirAbs;
  const relativeCapacitoriOSPath = convertToUnixPath(
    relative(podfilePath, await realpath(dirname(capacitoriOSPath))),
  );

  const capacitorPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Core,
  );
  const pods = await Promise.all(
    capacitorPlugins.map(
      async p =>
        `pod '${p.ios!.name}', :path => '${relative(
          podfilePath,
          await realpath(p.rootPath),
        )}'`,
    ),
  );
  const cordovaPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Cordova,
  );
  const noPodPlugins = cordovaPlugins.filter(filterNoPods);
  if (noPodPlugins.length > 0) {
    pods.push(
      `pod 'CordovaPlugins', :path => '../capacitor-cordova-ios-plugins'`,
    );
  }
  const podPlugins = cordovaPlugins.filter(el => !noPodPlugins.includes(el));
  if (podPlugins.length > 0) {
    pods.push(
      `pod 'CordovaPluginsStatic', :path => '../capacitor-cordova-ios-plugins'`,
    );
  }
  const resourcesPlugins = cordovaPlugins.filter(filterResources);
  if (resourcesPlugins.length > 0) {
    pods.push(
      `pod 'CordovaPluginsResources', :path => '../capacitor-cordova-ios-plugins'`,
    );
  }
  return `
  pod 'Capacitor', :path => '${relativeCapacitoriOSPath}'
  pod 'CapacitorCordova', :path => '${relativeCapacitoriOSPath}'
  ${pods.join('\n  ')}`;
}

function getFrameworkName(framework: any) {
  if (isFramework(framework)) {
    if (framework.$.custom && framework.$.custom === 'true') {
      return framework.$.src;
    }
    return framework.$.src.substr(0, framework.$.src.indexOf('.'));
  }
  return framework.$.src
    .substr(0, framework.$.src.indexOf('.'))
    .replace('lib', '');
}

function isFramework(framework: any) {
  return framework.$.src.split('.').pop().includes('framework');
}

async function generateCordovaPodspecs(
  cordovaPlugins: Plugin[],
  config: Config,
) {
  const noPodPlugins = cordovaPlugins.filter(filterNoPods);
  const podPlugins = cordovaPlugins.filter(el => !noPodPlugins.includes(el));
  generateCordovaPodspec(noPodPlugins, config, false);
  generateCordovaPodspec(podPlugins, config, true);
}

async function generateCordovaPodspec(
  cordovaPlugins: Plugin[],
  config: Config,
  isStatic: boolean,
) {
  const pluginsPath = resolve(
    config.ios.platformDirAbs,
    config.ios.assets.pluginsFolderName,
  );
  const weakFrameworks: string[] = [];
  const linkedFrameworks: string[] = [];
  const customFrameworks: string[] = [];
  const systemLibraries: string[] = [];
  const sourceFrameworks: string[] = [];
  const frameworkDeps: string[] = [];
  const compilerFlags: string[] = [];
  let prefsArray: any[] = [];
  let name = 'CordovaPlugins';
  let sourcesFolderName = 'sources';
  if (isStatic) {
    name += 'Static';
    frameworkDeps.push('s.static_framework = true');
    sourcesFolderName += 'static';
  }
  cordovaPlugins.map((plugin: any) => {
    const frameworks = getPlatformElement(plugin, platform, 'framework');
    frameworks.map((framework: any) => {
      if (!framework.$.type) {
        const name = getFrameworkName(framework);
        if (isFramework(framework)) {
          if (framework.$.weak && framework.$.weak === 'true') {
            if (!weakFrameworks.includes(name)) {
              weakFrameworks.push(name);
            }
          } else if (framework.$.custom && framework.$.custom === 'true') {
            const frameworktPath = join(sourcesFolderName, plugin.name, name);
            if (!customFrameworks.includes(frameworktPath)) {
              customFrameworks.push(frameworktPath);
            }
          } else {
            if (!linkedFrameworks.includes(name)) {
              linkedFrameworks.push(name);
            }
          }
        } else {
          if (!systemLibraries.includes(name)) {
            systemLibraries.push(name);
          }
        }
      } else if (framework.$.type && framework.$.type === 'podspec') {
        let depString = `s.dependency '${framework.$.src}'`;
        if (framework.$.spec && framework.$.spec !== '') {
          depString += `, '${framework.$.spec}'`;
        }
        if (!frameworkDeps.includes(depString)) {
          frameworkDeps.push(depString);
        }
      }
    });
    prefsArray = prefsArray.concat(
      getAllElements(plugin, platform, 'preference'),
    );
    const podspecs = getPlatformElement(plugin, platform, 'podspec');
    podspecs.map((podspec: any) => {
      podspec.pods.map((pods: any) => {
        pods.pod.map((pod: any) => {
          let depString = `s.dependency '${pod.$.name}'`;
          if (pod.$.spec && pod.$.spec !== '') {
            depString += `, '${pod.$.spec}'`;
          }
          if (!frameworkDeps.includes(depString)) {
            frameworkDeps.push(depString);
          }
        });
      });
    });
    const sourceFiles = getPlatformElement(plugin, platform, 'source-file');
    sourceFiles.map((sourceFile: any) => {
      if (sourceFile.$.framework && sourceFile.$.framework === 'true') {
        let fileName = sourceFile.$.src.split('/').pop();
        if (!fileName.startsWith('lib')) {
          fileName = 'lib' + fileName;
        }
        const frameworktPath = join(sourcesFolderName, plugin.name, fileName);
        if (!sourceFrameworks.includes(frameworktPath)) {
          sourceFrameworks.push(frameworktPath);
        }
      } else if (sourceFile.$['compiler-flags']) {
        const cFlag = sourceFile.$['compiler-flags'];
        if (!compilerFlags.includes(cFlag)) {
          compilerFlags.push(cFlag);
        }
      }
    });
  });
  const onlySystemLibraries = systemLibraries.filter(library =>
    removeNoSystem(library, sourceFrameworks),
  );
  if (weakFrameworks.length > 0) {
    frameworkDeps.push(`s.weak_frameworks = '${weakFrameworks.join(`', '`)}'`);
  }
  if (linkedFrameworks.length > 0) {
    frameworkDeps.push(`s.frameworks = '${linkedFrameworks.join(`', '`)}'`);
  }
  if (onlySystemLibraries.length > 0) {
    frameworkDeps.push(`s.libraries = '${onlySystemLibraries.join(`', '`)}'`);
  }
  if (customFrameworks.length > 0) {
    frameworkDeps.push(
      `s.vendored_frameworks = '${customFrameworks.join(`', '`)}'`,
    );
    frameworkDeps.push(
      `s.exclude_files = 'sources/**/*.framework/Headers/*.h'`,
    );
  }
  if (sourceFrameworks.length > 0) {
    frameworkDeps.push(
      `s.vendored_libraries = '${sourceFrameworks.join(`', '`)}'`,
    );
  }
  if (compilerFlags.length > 0) {
    frameworkDeps.push(`s.compiler_flags = '${compilerFlags.join(' ')}'`);
  }
  const arcPlugins = cordovaPlugins.filter(filterARCFiles);
  if (arcPlugins.length > 0) {
    frameworkDeps.push(`s.subspec 'noarc' do |sna|
      sna.requires_arc = false
      sna.source_files = 'noarc/**/*.{swift,h,m,c,cc,mm,cpp}'
    end`);
  }
  let frameworksString = frameworkDeps.join('\n    ');
  frameworksString = await replaceFrameworkVariables(
    config,
    prefsArray,
    frameworksString,
  );
  const content = `
  Pod::Spec.new do |s|
    s.name = '${name}'
    s.version = '${config.cli.package.version}'
    s.summary = 'Autogenerated spec'
    s.license = 'Unknown'
    s.homepage = 'https://example.com'
    s.authors = { 'Capacitor Generator' => 'hi@example.com' }
    s.source = { :git => 'https://github.com/ionic-team/does-not-exist.git', :tag => '${
      config.cli.package.version
    }' }
    s.source_files = '${sourcesFolderName}/**/*.{swift,h,m,c,cc,mm,cpp}'
    s.ios.deployment_target  = '${config.ios.minVersion}'
    s.xcconfig = {'GCC_PREPROCESSOR_DEFINITIONS' => '$(inherited) COCOAPODS=1 WK_WEB_VIEW_ONLY=1' }
    s.dependency 'CapacitorCordova'${getLinkerFlags(config)}
    s.swift_version  = '${config.ios.cordovaSwiftVersion}'
    ${frameworksString}
  end`;
  await writeFile(join(pluginsPath, `${name}.podspec`), content);
}

function getLinkerFlags(config: Config) {
  if (config.app.extConfig.ios?.cordovaLinkerFlags) {
    return `\n    s.pod_target_xcconfig = { 'OTHER_LDFLAGS' => '${config.app.extConfig.ios.cordovaLinkerFlags.join(
      ' ',
    )}' }`;
  }
  return '';
}

async function copyPluginsNativeFiles(
  config: Config,
  cordovaPlugins: Plugin[],
) {
  const pluginsPath = resolve(
    config.ios.platformDirAbs,
    config.ios.assets.pluginsFolderName,
  );
  for (const p of cordovaPlugins) {
    const sourceFiles = getPlatformElement(p, platform, 'source-file');
    const headerFiles = getPlatformElement(p, platform, 'header-file');
    const codeFiles = sourceFiles.concat(headerFiles);
    const frameworks = getPlatformElement(p, platform, 'framework');
    const podFrameworks = frameworks.filter(
      (framework: any) => framework.$.type && framework.$.type === 'podspec',
    );
    const podspecs = getPlatformElement(p, platform, 'podspec');
    let sourcesFolderName = 'sources';
    if (podFrameworks.length > 0 || podspecs.length > 0) {
      sourcesFolderName += 'static';
    }
    const sourcesFolder = join(pluginsPath, sourcesFolderName, p.name);
    for (const codeFile of codeFiles) {
      let fileName = codeFile.$.src.split('/').pop();
      const fileExt = codeFile.$.src.split('.').pop();
      if (fileExt === 'a' && !fileName.startsWith('lib')) {
        fileName = 'lib' + fileName;
      }
      let destFolder = sourcesFolderName;
      if (
        codeFile.$['compiler-flags'] &&
        codeFile.$['compiler-flags'] === '-fno-objc-arc'
      ) {
        destFolder = 'noarc';
      }
      const filePath = getFilePath(config, p, codeFile.$.src);
      const fileDest = join(pluginsPath, destFolder, p.name, fileName);
      await copy(filePath, fileDest);
      if (!codeFile.$.framework) {
        let fileContent = await readFile(fileDest, { encoding: 'utf-8' });
        if (fileExt === 'swift') {
          fileContent = 'import Cordova\n' + fileContent;
          await writeFile(fileDest, fileContent, { encoding: 'utf-8' });
        } else {
          if (fileContent.includes('@import Firebase;')) {
            fileContent = fileContent.replace(
              '@import Firebase;',
              '#import <Firebase/Firebase.h>',
            );
            await writeFile(fileDest, fileContent, { encoding: 'utf-8' });
          }
          if (
            fileContent.includes('[NSBundle bundleForClass:[self class]]') ||
            fileContent.includes('[NSBundle bundleForClass:[CDVCapture class]]')
          ) {
            fileContent = fileContent.replace(
              '[NSBundle bundleForClass:[self class]]',
              '[NSBundle mainBundle]',
            );
            fileContent = fileContent.replace(
              '[NSBundle bundleForClass:[CDVCapture class]]',
              '[NSBundle mainBundle]',
            );
            await writeFile(fileDest, fileContent, { encoding: 'utf-8' });
          }
          if (
            fileContent.includes('[self.webView superview]') ||
            fileContent.includes('self.webView.superview')
          ) {
            fileContent = fileContent.replace(
              /\[self.webView superview\]/g,
              'self.viewController.view',
            );
            fileContent = fileContent.replace(
              /self.webView.superview/g,
              'self.viewController.view',
            );
            await writeFile(fileDest, fileContent, { encoding: 'utf-8' });
          }
        }
      }
    }
    const resourceFiles = getPlatformElement(p, platform, 'resource-file');
    for (const resourceFile of resourceFiles) {
      const fileName = resourceFile.$.src.split('/').pop();
      await copy(
        getFilePath(config, p, resourceFile.$.src),
        join(pluginsPath, 'resources', fileName),
      );
    }
    for (const framework of frameworks) {
      if (framework.$.custom && framework.$.custom === 'true') {
        await copy(
          getFilePath(config, p, framework.$.src),
          join(sourcesFolder, framework.$.src),
        );
      }
    }
  }
}

async function removePluginsNativeFiles(config: Config) {
  const pluginsPath = resolve(
    config.ios.platformDirAbs,
    config.ios.assets.pluginsFolderName,
  );
  await remove(pluginsPath);
  await copy(config.ios.assets.pluginsDir, pluginsPath);
}

function filterNoPods(plugin: Plugin) {
  const frameworks = getPlatformElement(plugin, platform, 'framework');
  const podFrameworks = frameworks.filter(
    (framework: any) => framework.$.type && framework.$.type === 'podspec',
  );
  const podspecs = getPlatformElement(plugin, platform, 'podspec');
  return podFrameworks.length === 0 && podspecs.length === 0;
}

function filterResources(plugin: Plugin) {
  const resources = getPlatformElement(plugin, platform, 'resource-file');
  return resources.length > 0;
}

function filterARCFiles(plugin: Plugin) {
  const sources = getPlatformElement(plugin, platform, 'source-file');
  const sourcesARC = sources.filter(
    (sourceFile: any) =>
      sourceFile.$['compiler-flags'] &&
      sourceFile.$['compiler-flags'] === '-fno-objc-arc',
  );
  return sourcesARC.length > 0;
}

function removeNoSystem(library: string, sourceFrameworks: string[]) {
  const libraries = sourceFrameworks.filter(framework =>
    framework.includes(library),
  );
  return libraries.length === 0;
}

async function getPluginsTask(config: Config) {
  return await runTask('Updating iOS plugins', async () => {
    const allPlugins = await getPlugins(config);
    const iosPlugins = await getIOSPlugins(allPlugins);
    return iosPlugins;
  });
}

async function replaceFrameworkVariables(
  config: Config,
  prefsArray: any[],
  frameworkString: string,
) {
  prefsArray.map((preference: any) => {
    frameworkString = frameworkString.replace(
      new RegExp(('$' + preference.$.name).replace('$', '\\$&'), 'g'),
      preference.$.default,
    );
  });
  return frameworkString;
}
