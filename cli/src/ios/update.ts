import { checkCocoaPods, checkIOSProject, getIOSPlugins } from './common';
import { CheckFunction, log, logInfo, logWarn, runCommand, runTask } from '../common';
import { copySync, readFileAsync, removeSync, writeFileAsync } from '../util/fs';
import { Config } from '../config';
import { join, resolve } from 'path';
import { getFilePath, getPlatformElement, getPluginPlatform, getPlugins, getPluginType, printPlugins, Plugin, PluginType } from '../plugin';
import { checkAndInstallDependencies, handleCordovaPluginsJS, logCordovaManualSteps } from '../cordova';

import * as inquirer from 'inquirer';
import { create } from 'domain';

export const updateIOSChecks: CheckFunction[] = [checkCocoaPods, checkIOSProject];
const platform = 'ios';

export async function updateIOS(config: Config) {
  var chalk = require('chalk');
  /*
  log(`\n${chalk.bold('iOS Note:')} you should periodically run "pod repo update" to make sure your ` +
          `local Pod repo is up to date and can find new Pod releases.\n`);
  */


  /*
  var answers = await inquirer.prompt([{
    type: 'input',
    name: 'updateRepo',
    message: `Run "pod repo update" to make sure you have the latest Pods available before updating (takes a few minutes)?`,
    default: 'n'
  }]);

  if (answers.updateRepo === 'y') {
    await runTask(`Running pod repo update to update CocoaPods`, () => {
      return runCommand(`pod repo update`);
    });
  }
  */

  let plugins = await getPluginsTask(config);

  const capacitorPlugins = plugins.filter(p => getPluginType(p, platform) === PluginType.Core);

  printPlugins(capacitorPlugins, 'ios');

  let cordovaPlugins: Array<Plugin> = [];
  let needsPluginUpdate = true;
  while (needsPluginUpdate) {
    cordovaPlugins = plugins
      .filter(p => getPluginType(p, platform) === PluginType.Cordova);
    needsPluginUpdate = await checkAndInstallDependencies(config, cordovaPlugins, platform);
    if (needsPluginUpdate) {
      plugins = await getPluginsTask(config);
    }
  }

  removePluginsNativeFiles(config);
  if (cordovaPlugins.length > 0) {
    copyPluginsNativeFiles(config, cordovaPlugins);
  }
  await handleCordovaPluginsJS(cordovaPlugins, config, platform);
  await generateCordovaPodspecs(cordovaPlugins, config);
  await installCocoaPodsPlugins(config, plugins);
  await logCordovaManualSteps(cordovaPlugins, config, platform);

}

export async function installCocoaPodsPlugins(config: Config, plugins: Plugin[]) {
  await runTask('Updating iOS native dependencies', () => {
    return updatePodfile(config, plugins);
  });
}

export async function updatePodfile(config: Config, plugins: Plugin[]) {
  const dependenciesContent = generatePodFile(config, plugins);
  const projectName = config.ios.nativeProjectName;
  const projectRoot = resolve(config.app.rootDir, config.ios.name, projectName);
  const podfilePath = join(projectRoot, 'Podfile');
  const podfileLockPath = join(projectRoot, 'Podfile.lock');
  let podfileContent = await readFileAsync(podfilePath, 'utf8');
  podfileContent = podfileContent.replace(/(Automatic Capacitor Pod dependencies, do not delete)[\s\S]*(# Do not delete)/, '$1' + dependenciesContent + '\n  $2');
  podfileContent = podfileContent.replace(/platform :ios, '[^']*'/ , `platform :ios, '${config.ios.minVersion}'`);
  await writeFileAsync(podfilePath, podfileContent, 'utf8');
  removeSync(podfileLockPath);
  await runCommand(`cd "${config.app.rootDir}" && cd "${config.ios.name}" && cd "${projectName}" && pod install && xcodebuild -project App.xcodeproj clean`);
}

export function generatePodFile(config: Config, plugins: Plugin[]) {
  const capacitorPlugins = plugins.filter(p => getPluginType(p, platform) !== PluginType.Cordova);
  const pods = capacitorPlugins
    .map((p) => `pod '${p.ios!.name}', :path => '../../node_modules/${p.id}/${p.ios!.path}'`);
  const cordovaPlugins = plugins.filter(p => getPluginType(p, platform) === PluginType.Cordova);
  const noPodPlugins = cordovaPlugins.filter(filterNoPods);
  if (noPodPlugins.length > 0) {
    pods.push(`pod 'CordovaPlugins', :path => '../../node_modules/@capacitor/cli/assets/capacitor-cordova-ios-plugins'
    `);
  }
  const podPlugins = cordovaPlugins.filter((el) => !noPodPlugins.includes(el));
  if (podPlugins.length > 0) {
    pods.push(`pod 'CordovaPluginsStatic', :path => '../../node_modules/@capacitor/cli/assets/capacitor-cordova-ios-plugins'
    `);
  }
  const resourcesPlugins = cordovaPlugins.filter(filterResources);
  if (resourcesPlugins.length > 0) {
    pods.push(`pod 'CordovaPluginsResources', :path => '../../node_modules/@capacitor/cli/assets/capacitor-cordova-ios-plugins'
    `);
  }
    return `
  ${config.ios.capacitorRuntimePod}
  ${config.ios.capacitorCordovaRuntimePod}
  ${pods.join('\n      ')}`;
}

function getFrameworkName(framework: any) {
  if (isFramework(framework)) {
    if (framework.$.custom && framework.$.custom === 'true') {
      return framework.$.src;
    }
    return framework.$.src.substr(0, framework.$.src.indexOf('.'));
  }
  return framework.$.src.substr(0, framework.$.src.indexOf('.')).replace('lib','');
}

function isFramework(framework: any) {
  return framework.$.src.split(".").pop() === 'framework';
}

async function generateCordovaPodspecs(cordovaPlugins: Plugin[], config: Config) {
  const noPodPlugins = cordovaPlugins.filter(filterNoPods);
  const podPlugins = cordovaPlugins.filter((el) => !noPodPlugins.includes(el));
  generateCordovaPodspec(noPodPlugins, config, false);
  generateCordovaPodspec(podPlugins, config, true);
}

async function generateCordovaPodspec(cordovaPlugins: Plugin[], config: Config, isStatic: boolean) {
  const pluginsPath = resolve(config.app.rootDir, 'node_modules', '@capacitor/cli', 'assets', 'capacitor-cordova-ios-plugins');
  let weakFrameworks: Array<string> = [];
  let linkedFrameworks: Array<string> = [];
  let customFrameworks: Array<string> = [];
  let systemLibraries: Array<string> = [];
  let sourceFrameworks: Array<string> = [];
  let frameworkDeps: Array<string> = [];
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
          } if (framework.$.custom && framework.$.custom === 'true') {
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
        frameworkDeps.push(`s.dependency '${framework.$.src}', '${framework.$.spec}'`);
      }
    });
    const sourceFiles = getPlatformElement(plugin, platform, 'source-file');
    sourceFiles.map((sourceFile: any) => {
      if (sourceFile.$.framework && sourceFile.$.framework === 'true') {
        const fileName = sourceFile.$.src.split("/").pop();
        const frameworktPath = join(sourcesFolderName, plugin.name, fileName);
        if (!sourceFrameworks.includes(frameworktPath)) {
          sourceFrameworks.push(frameworktPath);
        }
      }
    })
  });
  if (weakFrameworks.length > 0) {
    frameworkDeps.push(`s.weak_frameworks = '${weakFrameworks.join("', '")}'`);
  }
  if (linkedFrameworks.length > 0) {
    frameworkDeps.push(`s.frameworks = '${linkedFrameworks.join("', '")}'`);
  }
  if (systemLibraries.length > 0) {
    frameworkDeps.push(`s.libraries = '${systemLibraries.join("', '")}'`);
  }
  if (customFrameworks.length > 0) {
    frameworkDeps.push(`s.vendored_frameworks = '${customFrameworks.join("', '")}'`);
  }
  if (sourceFrameworks.length > 0) {
    frameworkDeps.push(`s.vendored_libraries = '${sourceFrameworks.join("', '")}'`);
  }
  const arcPlugins = cordovaPlugins.filter(filterARCFiles);
  if (arcPlugins.length > 0) {
    frameworkDeps.push(`s.subspec 'noarc' do |sna|
      sna.requires_arc = false
      sna.source_files = 'noarc/**/*.{swift,h,m,c,cc,mm,cpp}'
    end`);
  }
  const frameworksString = frameworkDeps.join("\n    ");

  const content = `
  Pod::Spec.new do |s|
    s.name = '${name}'
    s.version = '${config.cli.package.version}'
    s.summary = 'Autogenerated spec'
    s.license = 'Unknown'
    s.homepage = 'https://example.com'
    s.authors = { 'Capacitor Generator' => 'hi@example.com' }
    s.source = { :git => 'https://github.com/ionic-team/does-not-exist.git', :tag => '${config.cli.package.version}' }
    s.source_files = '${sourcesFolderName}/**/*.{swift,h,m,c,cc,mm,cpp}'
    s.ios.deployment_target  = '${config.ios.minVersion}'
    s.dependency 'CapacitorCordova'
    ${frameworksString}
  end`;
  await writeFileAsync(join(pluginsPath, `${name}.podspec`), content);
}

function copyPluginsNativeFiles(config: Config, cordovaPlugins: Plugin[]) {
  const pluginsPath = resolve(config.app.rootDir, 'node_modules', '@capacitor/cli', 'assets', 'capacitor-cordova-ios-plugins');
  cordovaPlugins.map( p => {
    const sourceFiles = getPlatformElement(p, platform, 'source-file');
    const headerFiles = getPlatformElement(p, platform, 'header-file');
    const codeFiles = sourceFiles.concat(headerFiles);
    const frameworks = getPlatformElement(p, platform, 'framework');
    const podFrameworks = frameworks.filter((framework: any) => framework.$.type && framework.$.type === 'podspec');
    let sourcesFolderName = 'sources';
    if (podFrameworks.length > 0) {
      sourcesFolderName += 'static';
    }
    const sourcesFolder = join(pluginsPath, sourcesFolderName, p.name);
    codeFiles.map( (codeFile: any) => {
      const fileName = codeFile.$.src.split("/").pop();
      let destFolder = sourcesFolderName;
      if (codeFile.$['compiler-flags'] && codeFile.$['compiler-flags'] === '-fno-objc-arc') {
        destFolder = 'noarc';
      }
      copySync(getFilePath(config, p, codeFile.$.src), join(pluginsPath, destFolder, p.name, fileName));
    });
    const resourceFiles = getPlatformElement(p, platform, 'resource-file');
    resourceFiles.map( (resourceFile: any) => {
      const fileName = resourceFile.$.src.split("/").pop();
      copySync(getFilePath(config, p, resourceFile.$.src), join(pluginsPath, 'resources', fileName));
    });
    frameworks.map((framework: any) => {
      if (framework.$.custom && framework.$.custom === 'true') {
        copySync(getFilePath(config, p, framework.$.src),  join(sourcesFolder, framework.$.src));
      }
    });
  });
}

function removePluginsNativeFiles(config: Config) {
  const pluginsPath = resolve(config.app.rootDir, 'node_modules', '@capacitor/cli', 'assets', 'capacitor-cordova-ios-plugins');
  removeSync(join(pluginsPath, 'sources'));
  removeSync(join(pluginsPath, 'sourcesstatic'));
  removeSync(join(pluginsPath, 'resources'));
  removeSync(join(pluginsPath, 'noarc'));
}

function filterNoPods(plugin: Plugin) {
  const frameworks = getPlatformElement(plugin, platform, 'framework');
  const podFrameworks = frameworks.filter((framework: any) => framework.$.type && framework.$.type === 'podspec');
  return podFrameworks.length === 0;
}

function filterResources(plugin: Plugin) {
  const resources = getPlatformElement(plugin, platform, 'resource-file');
  return resources.length > 0;
}

function filterARCFiles(plugin: Plugin) {
  const sources = getPlatformElement(plugin, platform, 'source-file');
  const sourcesARC = sources.filter((sourceFile: any) => sourceFile.$['compiler-flags'] && sourceFile.$['compiler-flags'] === '-fno-objc-arc');
  return sourcesARC.length > 0;
}

async function getPluginsTask(config: Config) {
  return await runTask('Updating iOS plugins', async () => {
    const allPlugins = await getPlugins(config);
    const iosPlugins = await getIOSPlugins(config, allPlugins);
    return iosPlugins;
  });
}