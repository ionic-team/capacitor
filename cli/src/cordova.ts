import { Config } from './config';
import { Plugin, PluginType, getJSModules, getPlatformElement, getPluginPlatform, getPluginType, getPlugins, printPlugins } from './plugin';
import { copySync, ensureDirSync, readFileAsync, removeSync, writeFileAsync } from './util/fs';
import { basename, extname, join, resolve } from 'path';
import { buildXmlElement, installDeps, log, logError, logFatal, logInfo, logWarn, readXML, resolveNode, writeXML } from './common';
import { copy as fsCopy, existsSync } from 'fs-extra';
import { getAndroidPlugins } from './android/common';
import { getIOSPlugins } from './ios/common';
import { copy } from './tasks/copy';
import * as inquirer from 'inquirer';

const plist = require('plist');
const chalk = require('chalk');

/**
 * Build the root cordova_plugins.js file referencing each Plugin JS file.
 */
export function generateCordovaPluginsJSFile(config: Config, plugins: Plugin[], platform: string) {
  let pluginModules: Array<any> = [];
  let pluginExports: Array<string> = [];
  plugins.map((p) => {
    const pluginId = p.xml.$.id;
    const jsModules = getJSModules(p, platform);
    jsModules.map((jsModule: any) => {
      let clobbers: Array<string> = [];
      let merges: Array<string> = [];
      let clobbersModule = '';
      let mergesModule = '';
      let runsModule = '';
      let clobberKey = '';
      let mergeKey = '';
      if (jsModule.clobbers) {
        jsModule.clobbers.map((clobber: any) => {
          clobbers.push(clobber.$.target);
          clobberKey = clobber.$.target;
        });
        clobbersModule = `,
        "clobbers": [
          "${clobbers.join('",\n          "')}"
        ]`;
      }
      if (jsModule.merges) {
        jsModule.merges.map((merge: any) => {
          merges.push(merge.$.target);
          mergeKey = merge.$.target;
        });
        mergesModule = `,
        "merges": [
          "${merges.join('",\n          "')}"
        ]`;
      }
      if (jsModule.runs) {
        runsModule = ',\n        "runs": true';
      }
      const pluginModule = {
        clobber: clobberKey,
        merge: mergeKey,
        // mimics Cordova's module name logic if the name attr is missing
        pluginContent: `{
          "id": "${pluginId + '.' + (jsModule.$.name || jsModule.$.src.match(/([^\/]+)\.js/)[1])}",
          "file": "plugins/${pluginId}/${jsModule.$.src}",
          "pluginId": "${pluginId}"${clobbersModule}${mergesModule}${runsModule}
        }`
      };
      pluginModules.push(pluginModule);
    });
    pluginExports.push(`"${pluginId}": "${p.xml.$.version}"`);
  });
  return `
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      ${pluginModules
        .sort(
          (a, b) => (a.clobber && b.clobber) // Clobbers in alpha order
            ? a.clobber.localeCompare(b.clobber)
            : ( (a.clobber || b.clobber) // Clobbers before anything else
                  ? b.clobber.localeCompare(a.clobber)
                  : a.merge.localeCompare(b.merge) // Merges in alpha order
              )
        )
        .map(e => e.pluginContent)
        .join(',\n      ')}
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
  await Promise.all(cordovaPlugins.map(async p => {
    const pluginId = p.xml.$.id;
    const pluginDir = join(pluginsDir, pluginId, 'www');
    ensureDirSync(pluginDir);
    const jsModules = getJSModules(p, platform);
    await Promise.all(jsModules.map(async (jsModule: any) => {
      const filePath = join(webDir, 'plugins', pluginId, jsModule.$.src);
      copySync(join(p.rootPath, jsModule.$.src), filePath);
      let data = await readFileAsync(filePath, 'utf8');
      data = data.trim();
      // mimics Cordova's module name logic if the name attr is missing
      const name = pluginId + '.' + (jsModule.$.name || basename(jsModule.$.src, extname(jsModule.$.src)));
      data = `cordova.define("${name}", function(require, exports, module) { \n${data}\n});`;
      data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '');
      await writeFileAsync(filePath, data, 'utf8');
    }));
  }));
  writeFileAsync(cordovaPluginsJSFile, generateCordovaPluginsJSFile(config, cordovaPlugins, platform));
}

export async function copyCordovaJS(config: Config, platform: string) {
  const cordovaPath = resolveNode(config, '@capacitor/core', 'cordova.js');
  if (!cordovaPath) {
    logFatal(`Unable to find node_modules/@capacitor/core/cordova.js. Are you sure`,
    '@capacitor/core is installed? This file is currently required for Capacitor to function.');
    return;
  }

  return fsCopy(cordovaPath, join(getWebDir(config, platform), 'cordova.js'));
}

export async function createEmptyCordovaJS(config: Config, platform: string) {
  await writeFileAsync(join(getWebDir(config, platform), 'cordova.js'), '');
  await writeFileAsync(join(getWebDir(config, platform), 'cordova_plugins.js'), '');
}

export function removePluginFiles(config: Config, platform: string) {
  const webDir = getWebDir(config, platform);
  const pluginsDir = join(webDir, 'plugins');
  const cordovaPluginsJSFile = join(webDir, 'cordova_plugins.js');
  removeSync(pluginsDir);
  removeSync(cordovaPluginsJSFile);
}

export async function autoGenerateConfig(config: Config, cordovaPlugins: Plugin[], platform: string) {
  let xmlDir = join(config.android.resDirAbs, 'xml');
  const fileName = 'config.xml';
  if (platform === 'ios') {
    xmlDir = join(config.ios.platformDir, config.ios.nativeProjectName, config.ios.nativeProjectName);
  }
  ensureDirSync(xmlDir);
  const cordovaConfigXMLFile = join(xmlDir, fileName);
  removeSync(cordovaConfigXMLFile);
  let pluginEntries: Array<any> = [];
  cordovaPlugins.map(p => {
    const currentPlatform = getPluginPlatform(p, platform);
    if (currentPlatform) {
      const configFiles = currentPlatform['config-file'];
      if (configFiles) {
        const configXMLEntries = configFiles.filter(function(item: any) { return item.$ && item.$.target.includes(fileName); });
        configXMLEntries.map(  (entry: any)  => {
          if (entry.feature) {
            const feature = { feature: entry.feature };
            pluginEntries.push(feature);
          }
        });
      }
    }
  });

  const pluginEntriesString: Array<string> = await Promise.all(pluginEntries.map(async (item): Promise<string> => {
    const xmlString = await writeXML(item);
    return xmlString;
  }));
  let pluginPreferencesString: Array<string> = [];
  if (config.app.extConfig && config.app.extConfig.cordova && config.app.extConfig.cordova.preferences) {
    pluginPreferencesString = await Promise.all(Object.keys(config.app.extConfig.cordova.preferences).map(async (key): Promise<string> => {
      return `
  <preference name="${key}" value="${config.app.extConfig.cordova.preferences[key]}" />`;
    }));
  }
  const content = `<?xml version='1.0' encoding='utf-8'?>
<widget version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
  <access origin="*" />
  ${pluginEntriesString.join('')}
  ${pluginPreferencesString.join('')}
</widget>`;
  await writeFileAsync(cordovaConfigXMLFile, content);
}

function getWebDir(config: Config, platform: string): string {
  if (platform === 'ios') {
    return config.ios.webDirAbs;
  }
  if (platform === 'android') {
    return config.android.webDirAbs;
  }
  return '';
}

export async function handleCordovaPluginsJS(cordovaPlugins: Plugin[], config: Config, platform: string) {
  if (!existsSync(getWebDir(config, platform))) {
    await copy(config, platform);
  }
  if (cordovaPlugins.length > 0) {
    printPlugins(cordovaPlugins, platform, 'cordova');
    await copyCordovaJS(config, platform);
    await copyPluginsJS(config, cordovaPlugins, platform);
  } else {
    removePluginFiles(config, platform);
    await createEmptyCordovaJS(config, platform);
  }
  await autoGenerateConfig(config, cordovaPlugins, platform);
}

export async function copyCordovaJSFiles(config: Config, platform: string) {
  const allPlugins = await getPlugins(config);
  let plugins: Plugin[] = [];
  if (platform === config.ios.name) {
    plugins = getIOSPlugins(allPlugins);
  } else if (platform === config.android.name) {
    plugins = getAndroidPlugins(allPlugins);
  }
  const cordovaPlugins = plugins
  .filter(p => getPluginType(p, platform) === PluginType.Cordova);
  await handleCordovaPluginsJS(cordovaPlugins, config, platform);
}

export async function logCordovaManualSteps(cordovaPlugins: Plugin[], config: Config, platform: string) {
  cordovaPlugins.map(p => {
    const editConfig = getPlatformElement(p, platform, 'edit-config');
    const configFile = getPlatformElement(p, platform, 'config-file');
    editConfig.concat(configFile).map(async (configElement: any) => {
      if (configElement.$ && !configElement.$.target.includes('config.xml')) {
        if (platform === config.ios.name) {
          if (configElement.$.target.includes('Info.plist')) {
            logiOSPlist(configElement, config, p);
          }
        }
      }
    });
  });
}

async function logiOSPlist (configElement: any, config: Config, plugin: Plugin) {
  const plistPath = resolve(config.ios.platformDir, config.ios.nativeProjectName, config.ios.nativeProjectName, 'Info.plist');
  const xmlMeta = await readXML(plistPath);
  let data = await readFileAsync(plistPath, 'utf8');
  var plistData = plist.parse(data);
  const dict = xmlMeta.plist.dict.pop();
  if (!dict.key.includes(configElement.$.parent)) {
    let xml = buildConfigFileXml(configElement);
    xml = `<key>${configElement.$.parent}</key>${getConfigFileTagContent(xml)}`;
    logWarn(`Plugin ${plugin.id} requires you to add \n  ${xml} to your Info.plist to work`);
  } else if (configElement.array || configElement.dict) {
    if (configElement.array && configElement.array[0] && configElement.array[0].string) {
        var xml = '';
        configElement.array[0].string.map((element: any) => {
          if (!plistData[configElement.$.parent].includes(element)) {
            xml = xml.concat(`<string>${element}</string>\n`);
          }
        });
        if (xml.length > 0) {
          logWarn(`Plugin ${plugin.id} requires you to add \n${xml} in the existing ${chalk.bold(configElement.$.parent)} array of your Info.plist to work`);
        }
    } else {
      logPossibleMissingItem(configElement, plugin);
    }
  }
}

function logPossibleMissingItem (configElement: any, plugin: Plugin) {
  let xml = buildConfigFileXml(configElement);
  xml = getConfigFileTagContent(xml);
  xml = removeOuterTags(xml);
  logWarn(`Plugin ${plugin.id} might require you to add ${xml} in the existing ${chalk.bold(configElement.$.parent)} entry of your Info.plist to work`);
}

function buildConfigFileXml(configElement: any) {
  return buildXmlElement(configElement, 'config-file');
}

function getConfigFileTagContent(str: string) {
  return str.replace(/\<config-file.+\"\>|\<\/config-file>/g, '');
}

function removeOuterTags(str: string) {
  var start = str.indexOf('>') + 1;
  var end = str.lastIndexOf('<');
  return str.substring(start, end);
}

export async function checkAndInstallDependencies(config: Config, plugins: Plugin[], platform: string) {
  let needsUpdate = false;
  const cordovaPlugins = plugins
      .filter(p => getPluginType(p, platform) === PluginType.Cordova);
  const incompatible = plugins.filter(p => getPluginType(p, platform) === PluginType.Incompatible);
  await Promise.all(cordovaPlugins.map(async (p) => {
    let allDependencies: Array<string> = [];
    allDependencies = allDependencies.concat(getPlatformElement(p, platform, 'dependency'));
    if (p.xml['dependency']) {
      allDependencies = allDependencies.concat(p.xml['dependency']);
    }
    allDependencies = allDependencies.filter((dep: any) => !getIncompatibleCordovaPlugins(platform).includes(dep.$.id) && incompatible.filter(p => p.id === dep.$.id || p.xml.$.id === dep.$.id).length === 0);
    if (allDependencies) {
      await Promise.all(allDependencies.map(async (dep: any) => {
        if (cordovaPlugins.filter(p => p.id === dep.$.id || p.xml.$.id === dep.$.id).length === 0) {
          let plugin = dep.$.id;
          if (dep.$.url && dep.$.url.startsWith('http')) {
            plugin = dep.$.url;
          }
          logInfo(`installing missing dependency plugin ${plugin}`);
          try {
            await installDeps(config.app.rootDir, [plugin], config);
            await config.updateAppPackage();
            needsUpdate = true;
          } catch (e) {
            log('\n');
            logError(`couldn't install dependency plugin ${plugin}`);
          }
        }
      }));
    }
  }));
  return needsUpdate;
}

export function getIncompatibleCordovaPlugins(platform: string) {
  let pluginList = ['cordova-plugin-splashscreen', 'cordova-plugin-ionic-webview', 'cordova-plugin-crosswalk-webview',
  'cordova-plugin-wkwebview-engine', 'cordova-plugin-console', 'cordova-plugin-music-controls',
  'cordova-plugin-add-swift-support', 'cordova-plugin-ionic-keyboard', 'cordova-plugin-braintree',
  '@ionic-enterprise/filesystem', '@ionic-enterprise/keyboard', '@ionic-enterprise/splashscreen'];
  if (platform === 'ios') {
    pluginList.push('cordova-plugin-googlemaps', 'cordova-plugin-statusbar', '@ionic-enterprise/statusbar');
  }
  if (platform === 'android') {
    pluginList.push('cordova-plugin-compat');
  }
  return pluginList;
}

export async function getCordovaPreferences(config: Config) {
  const configXml = join(config.app.rootDir, 'config.xml');
  let cordova: any = {};
  if (existsSync(configXml)) {
    cordova.preferences = {};
    const xmlMeta = await readXML(configXml);
    xmlMeta.widget.preference.map((pref: any) => {
      cordova.preferences[pref.$.name] = pref.$.value;
    });
  }
  if (config.app.extConfig && config.app.extConfig.cordova && config.app.extConfig.cordova.preferences && cordova.preferences) {
    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: 'capacitor.config.json already contains cordova preferences. Overwrite with values from config.xml?'
    });
    if (!answer.confirm) {
      cordova = config.app.extConfig.cordova;
    }
  }
  if (config.app.extConfig && !cordova.preferences) {
    cordova = config.app.extConfig.cordova;
  }
  return cordova;
}
