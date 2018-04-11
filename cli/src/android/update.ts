import { Config } from '../config';
import { buildXmlElement, log, logInfo, runTask } from '../common';
import { getFilePath, getPlatformElement, getPluginPlatform, getPlugins, getPluginType, printPlugins, Plugin, PluginType } from '../plugin';
import { getAndroidPlugins } from './common';
import { checkAndInstallDependencies, handleCordovaPluginsJS } from '../cordova';
import { copySync, ensureDirSync, readFileAsync, removeSync, writeFileAsync } from '../util/fs';
import { allSerial } from '../util/promise';
import { join, resolve } from 'path';

const platform = 'android';

export async function updateAndroid(config: Config) {
  let plugins = await getPluginsTask(config);

  const capacitorPlugins = plugins.filter(p => getPluginType(p, platform) === PluginType.Core);

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

  printPlugins(capacitorPlugins, 'android');

  removePluginsNativeFiles(config);
  if (cordovaPlugins.length > 0) {
    copyPluginsNativeFiles(config, cordovaPlugins);
  }
  await handleCordovaPluginsJS(cordovaPlugins, config, platform);
  await installGradlePlugins(config, capacitorPlugins, cordovaPlugins);
  await handleCordovaPluginsGradle(config, cordovaPlugins);
  await writeCordovaAndroidManifest(cordovaPlugins, config);
}

export async function installGradlePlugins(config: Config, capacitorPlugins: Plugin[], cordovaPlugins: Plugin[]) {
  const settingsLines = `// DO NOT EDIT THIS FILE! IT IS GENERATED EACH TIME "capacitor update" IS RUN
${capacitorPlugins.map(p => {
  return `
include ':${p.id}'
project(':${p.id}').projectDir = new File('../node_modules/${p.id}/android/${p.id}')
`;
}).join('')}`;

  let applyArray: Array<any> = [];
  let frameworksArray: Array<any> = [];
  let prefsArray: Array<any> = [];
  cordovaPlugins.map( p => {
    const frameworks = getPlatformElement(p, platform, 'framework');
    frameworks.map((framework: any) => {
      if (framework.$.custom && framework.$.custom === 'true' && framework.$.type && framework.$.type === 'gradleReference') {
        applyArray.push(`apply from: "../../node_modules/${p.id}/${framework.$.src}"`);
      } else if (!framework.$.type && !framework.$.custom) {
        frameworksArray.push(`    implementation "${framework.$.src}"`);
      }
    });
    prefsArray = prefsArray.concat(getPlatformElement(p, platform, 'preference'));
  });
  let frameworkString = frameworksArray.join('\n');
  prefsArray.map((preference: any) => {
    frameworkString = frameworkString.replace(new RegExp(('$'+preference.$.name).replace('$', '\\$&'), 'g'), preference.$.default);
  });
  const dependencyLines = `// DO NOT EDIT THIS FILE! IT IS GENERATED EACH TIME "capacitor update" IS RUN

dependencies {
${capacitorPlugins.map(p => {
    return `    implementation project(':${p.id}')`;
  }).join('\n')}
${frameworkString}
}
${applyArray.join('\n')}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
`;

  await writeFileAsync(join(config.app.rootDir, 'android/capacitor.settings.gradle'), settingsLines);
  await writeFileAsync(join(config.app.rootDir, 'android/app/capacitor.build.gradle'), dependencyLines);
}

export async function handleCordovaPluginsGradle(config: Config,  cordovaPlugins: Plugin[]) {
  const pluginsFolder = resolve(config.app.rootDir, 'node_modules', '@capacitor/cli', 'assets', 'capacitor-android-plugins');
  const pluginsGradlePath = join(pluginsFolder, 'build.gradle');
  let frameworksArray: Array<any> = [];
  let prefsArray: Array<any> = [];
  cordovaPlugins.map( p => {
    const frameworks = getPlatformElement(p, platform, 'framework');
    frameworks.map((framework: any) => {
      if (!framework.$.type && !framework.$.custom) {
        frameworksArray.push(framework.$.src);
      }
    });
    prefsArray = prefsArray.concat(getPlatformElement(p, platform, 'preference'));
  });
  let frameworkString = frameworksArray.map(f => {
    return `    implementation "${f}"`;
  }).join('\n');
  prefsArray.map((preference: any) => {
    frameworkString = frameworkString.replace(new RegExp(('$'+preference.$.name).replace('$', '\\$&'), 'g'), preference.$.default);
  });
  let buildGradle = await readFileAsync(pluginsGradlePath, 'utf8');
  buildGradle = buildGradle.replace(/(SUB-PROJECT DEPENDENCIES START)[\s\S]*(\/\/ SUB-PROJECT DEPENDENCIES END)/, '$1\n' + frameworkString.concat('\n') + '    $2');
  await writeFileAsync(pluginsGradlePath, buildGradle);
}

function copyPluginsNativeFiles(config: Config, cordovaPlugins: Plugin[]) {
  const pluginsRoot = resolve(config.app.rootDir, 'node_modules', '@capacitor/cli', 'assets', 'capacitor-android-plugins');
  const pluginsPath = join(pluginsRoot, 'src', 'main');
  cordovaPlugins.map(p => {
    const androidPlatform = getPluginPlatform(p, platform);
    if (androidPlatform) {
      const sourceFiles = androidPlatform['source-file'];
      if (sourceFiles) {
        sourceFiles.map((sourceFile: any) => {
          const fileName = sourceFile.$.src.split('/').pop();
          const target = sourceFile.$['target-dir'].replace('src/', 'java/');
          copySync(getFilePath(config, p, sourceFile.$.src), join(pluginsPath, target, fileName));
        });
      }
      const resourceFiles = androidPlatform['resource-file'];
      if (resourceFiles) {
        resourceFiles.map((resourceFile: any) => {
          if (resourceFile.$.src.split('.').pop() === 'aar') {
            copySync(getFilePath(config, p, resourceFile.$.src), join(pluginsPath, 'libs', resourceFile.$['target'].split('/').pop()));
          } else {
            copySync(getFilePath(config, p, resourceFile.$.src), join(pluginsPath, resourceFile.$['target']));
          }
        });
      }
      const libFiles = getPlatformElement(p, platform, 'lib-file');
      libFiles.map((libFile: any) => {
        copySync(getFilePath(config, p, libFile.$.src), join(pluginsPath, 'libs', libFile.$.src.split('/').pop()));
      });
    }
  });
}

function removePluginsNativeFiles(config: Config) {
  const pluginsRoot = resolve(config.app.rootDir, 'node_modules', '@capacitor/cli', 'assets', 'capacitor-android-plugins');
  const pluginsPath = join(pluginsRoot, 'src', 'main');
  removeSync(join(pluginsRoot, 'gradle-files'));
  removeSync(join(pluginsPath, 'java'));
  removeSync(join(pluginsPath, 'res'));
  removeSync(join(pluginsPath, 'libs'));
}

async function getPluginsTask(config: Config) {
  return await runTask('Updating Android plugins', async () => {
    const allPlugins = await getPlugins(config);
    const androidPlugins = await getAndroidPlugins(config, allPlugins);
    return androidPlugins;
  });
}

async function writeCordovaAndroidManifest(cordovaPlugins: Plugin[], config: Config) {
  const pluginsFolder = resolve(config.app.rootDir, 'node_modules', '@capacitor/cli', 'assets', 'capacitor-android-plugins');
  const manifestPath = join(pluginsFolder, 'src', 'main', 'AndroidManifest.xml');
  let rootXMLEntries: Array<any> = [];
  let applicationXMLEntries: Array<any> = [];
  await Promise.all(cordovaPlugins.map(async p => {
    const editConfig = getPlatformElement(p, platform, 'edit-config');
    const configFile = getPlatformElement(p, platform, 'config-file');
    await Promise.all(editConfig.concat(configFile).map(async (configElement: any) => {
      if (configElement.$.target.includes('AndroidManifest.xml')) {
        const keys = Object.keys(configElement).filter(k  => k !== '$');
        await Promise.all(keys.map(async k => {
          await Promise.all(configElement[k].map(async (e: any) => {
            const xmlElement = await buildXmlElement(e, k)
            const pathParts = getPathParts(configElement.$.parent);
            if(pathParts.length > 1) {
              if (pathParts.pop() === 'application') {
                applicationXMLEntries.push(xmlElement);
              } else {
                logInfo(`plugin ${p.id} requires to add \n  ${xmlElement} to your Info.plist to work`);
              }
            } else {
              rootXMLEntries.push(xmlElement);
            }
          }));
        }));
      }
    }));
  }));
  let content = `<?xml version='1.0' encoding='utf-8'?>
<manifest package='capacitor.android.plugins' xmlns:android='http://schemas.android.com/apk/res/android'>
<application>
${applicationXMLEntries.join('\n')}
</application>
${rootXMLEntries.join('\n')}
</manifest>`;
  await writeFileAsync(manifestPath, content);
}

function getPathParts(path: string) {
  const rootPath = 'manifest';
  path = path.replace('/*', rootPath);
  let parts = path.split('/').filter(part => part !== '');
  if (parts.length > 1 || parts.includes(rootPath)) {
    return parts;
  }
  return [rootPath, path];
}