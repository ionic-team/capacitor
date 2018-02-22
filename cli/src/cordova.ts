import { Config } from './config';
import { getJSModules, getPluginPlatform, getPlugins, getPluginType, Plugin, PluginType } from './plugin';
import { copySync, ensureDirSync, existsAsync, readFileAsync, removeSync, writeFileAsync } from './util/fs';
import { join, resolve } from 'path';
import { log, logFatal, writeXML } from './common';
import { copy as fsCopy } from 'fs-extra';
import { getAndroidPlugins } from './android/common';
import { getIOSPlugins } from './ios/common';


/**
 * Build the root cordova_plugins.js file referencing each Plugin JS file.
 */
export function generateCordovaPluginsJSFile(config: Config, plugins: Plugin[], platform: string) {
  let pluginModules: Array<string> = [];
  let pluginExports: Array<string> = [];
  plugins.map((p) => {
    const jsModules = getJSModules(p, platform);
    jsModules.map((jsModule: any) => {
      let clobbers: Array<string> = [];
      let merges: Array<string> = [];
      let clobbersModule = '';
      let mergesModule = '';
      if (jsModule.clobbers) {
        jsModule.clobbers.map((clobber: any) => {
          clobbers.push(clobber.$.target);
        });
        clobbersModule = `,
        "clobbers": [
          "${clobbers.join('",\n          "')}"
        ]`;
      }
      if (jsModule.merges) {
        jsModule.merges.map((merge: any) => {
          merges.push(merge.$.target);
        });
        mergesModule = `,
        "merges": [
          "${merges.join('",\n          "')}"
        ]`;
      }
      pluginModules.push(`{
        "id": "${p.id}.${jsModule.$.name}",
        "file": "plugins/${p.id}/${jsModule.$.src}",
        "pluginId": "${p.id}"${clobbersModule}${mergesModule}
      }`
      );
    });
    pluginExports.push(`"${p.id}": "${p.xml.$.version}"`);
  });
  return `
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      ${pluginModules.join(',\n      ')}
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      ${pluginExports.join(',\n      ')}
    };
    // BOTTOM OF METADATA
    });
    `;
}

/**
 * Build the plugins/* files for each Cordova plugin installed.
 */
export async function copyPluginsJS(config: Config, cordovaPlugins: Plugin[], platform: string) {
  const webDir = getWebDir(config, platform);
  const pluginsDir = join(webDir, 'plugins');
  const cordovaPluginsJSFile = join(webDir, 'cordova_plugins.js');
  removePluginFiles(config, platform);
  cordovaPlugins.map(async p => {
    const pluginDir = join(pluginsDir, p.id, 'www');
    ensureDirSync(pluginDir);
    const jsModules = getJSModules(p, platform);
    jsModules.map(async (jsModule: any) => {
      const filePath = join(webDir, 'plugins', p.id, jsModule.$.src);
      copySync(join(p.rootPath, jsModule.$.src), filePath);
      let data = await readFileAsync(filePath, 'utf8');
      data = `cordova.define("${p.id}.${jsModule.$.name}", function(require, exports, module) { \n${data}\n});`;
      await writeFileAsync(filePath, data, 'utf8');
    });
  });
  writeFileAsync(cordovaPluginsJSFile, generateCordovaPluginsJSFile(config, cordovaPlugins, platform));
}

export async function copyCordovaJS(config: Config, platform: string) {
  const cordovaPath = resolve('node_modules', '@capacitor/core', 'cordova.js');
  if (!await existsAsync(cordovaPath)) {
    logFatal(`Unable to find node_modules/@capacitor/core/cordova.js. Are you sure`,
    '@capacitor/core is installed? This file is currently required for Capacitor to function.');
    return;
  }

  return fsCopy(cordovaPath, join(getWebDir(config, platform), 'cordova.js'));
}

export function createEmptyCordovaJS(config: Config, platform: string) {
  writeFileAsync(join(getWebDir(config, platform), 'cordova.js'), '');
  writeFileAsync(join(getWebDir(config, platform), 'cordova_plugins.js'), '');
}

export function removePluginFiles(config: Config, platform: string) {
  const webDir = getWebDir(config, platform);
  const pluginsDir = join(webDir, 'plugins');
  const cordovaPluginsJSFile = join(webDir, 'cordova_plugins.js');
  removeSync(pluginsDir);
  removeSync(cordovaPluginsJSFile);
}

export async function autoGenerateConfig(config: Config, cordovaPlugins: Plugin[], platform: string) {
  let xmlDir = join(config.android.resDir, 'xml');
  let target = 'res/xml/config.xml';
  if (platform === 'ios') {
    xmlDir = join(config.ios.platformDir, config.ios.nativeProjectName, config.ios.nativeProjectName);
    target = 'config.xml';
  }
  ensureDirSync(xmlDir);
  const cordovaConfigXMLFile = join(xmlDir, 'config.xml');
  removeSync(cordovaConfigXMLFile);
  let pluginEntries: Array<any> = [];
  cordovaPlugins.map( p => {
    const currentPlatform = getPluginPlatform(p, platform);
    if (currentPlatform) {
      const configFiles = currentPlatform['config-file'];
      if (configFiles) {
        const configXMLEntries = configFiles.filter(function(item: any) { return item.$.target === target; });
        configXMLEntries.map(  (entry: any)  => {
          const feature = { feature: entry.feature };
          pluginEntries.push(feature);
        });
      }
    }
  });

  const pluginEntriesString: Array<string> = await Promise.all(pluginEntries.map(async (item): Promise<string> => {
    const xmlString = await writeXML(item);
    return xmlString;
  }));
  const content = `<?xml version='1.0' encoding='utf-8'?>
  <widget version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
  ${pluginEntriesString.join('\n')}
  </widget>`;
  writeFileAsync(cordovaConfigXMLFile, content);
}

function getWebDir(config: Config, platform: string): string {
  if (platform === 'ios') {
    return config.ios.webDir;
  }
  if (platform === 'android') {
    return config.android.webDir;
  }
  return '';
}

export async function handleCordovaPluginsJS(cordovaPlugins: Plugin[], config: Config, platform: string) {
  if (cordovaPlugins.length > 0) {
    log(`Found ${cordovaPlugins.length} Cordova plugin(s):\n${cordovaPlugins.map(p => '  ' + p.id).join('\n')}`);
    await copyCordovaJS(config, platform);
    await copyPluginsJS(config, cordovaPlugins, platform);
  } else {
    removePluginFiles(config, platform);
    createEmptyCordovaJS(config, platform);
  }
  await autoGenerateConfig(config, cordovaPlugins, platform);
}

export async function copyCordovaJSFiles(config: Config, platform: string) {
  const allPlugins = await getPlugins();
  let plugins: Plugin[] = [];
  if (platform === config.ios.name) {
    plugins = await getIOSPlugins(allPlugins);
  } else if (platform === config.android.name) { 
    plugins = await getAndroidPlugins(allPlugins);
  }
  const cordovaPlugins = plugins
  .filter(p => getPluginType(p, platform) === PluginType.Cordova);
  await handleCordovaPluginsJS(cordovaPlugins, config, platform);
}