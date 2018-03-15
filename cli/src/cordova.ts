import { Config } from './config';
import { getJSModules, getPlatformElement, getPluginPlatform, getPlugins, getPluginType, Plugin, PluginType } from './plugin';
import { copySync, ensureDirSync, existsAsync, readFileAsync, removeSync, writeFileAsync } from './util/fs';
import { join, resolve } from 'path';
import { log, logFatal, logInfo, readXML, runCommand, writeXML } from './common';
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
  const cordovaPath = resolve(config.app.rootDir, 'node_modules', '@capacitor/core', 'cordova.js');
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
  let xmlDir = join(config.android.resDirAbs, 'xml');
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
    return config.ios.webDirAbs;
  }
  if (platform === 'android') {
    return config.android.webDirAbs;
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
  const allPlugins = await getPlugins(config);
  let plugins: Plugin[] = [];
  if (platform === config.ios.name) {
    plugins = await getIOSPlugins(config, allPlugins);
  } else if (platform === config.android.name) { 
    plugins = await getAndroidPlugins(config, allPlugins);
  }
  const cordovaPlugins = plugins
  .filter(p => getPluginType(p, platform) === PluginType.Cordova);
  await handleCordovaPluginsJS(cordovaPlugins, config, platform);
}

export async function logCordovaManualSteps(cordovaPlugins: Plugin[], config: Config, platform: string) {
  cordovaPlugins.map( p => {
    const editConfig = getPlatformElement(p, platform, 'edit-config');
    const configFile = getPlatformElement(p, platform, 'config-file');
    editConfig.concat(configFile).map(async (configElement: any) =>{
      if (!configElement.$.target.includes("config.xml")) {
        if (platform === config.ios.name) {
          if (configElement.$.target.includes("Info.plist")) {
            logiOSPlist(configElement, config, p);
          }
        } else if (platform === config.android.name) {
          if (configElement.$.target.includes("AndroidManifest.xml")) {
            logAndroidManifest(configElement, config, p);
          }
        }
      }
    });
  });
}

async function logiOSPlist (configElement: any, config: Config, plugin: Plugin) {
  const plistPath = resolve(config.ios.platformDir, config.ios.nativeProjectName, config.ios.nativeProjectName, 'Info.plist');
  const xmlMeta = await readXML(plistPath);
  const dict = xmlMeta.plist.dict.pop();
  if (!dict.key.includes(configElement.$.parent)) {
    let xml = await buildConfigFileXml(configElement);
    xml = `<key>${configElement.$.parent}</key>${getConfigFileTagContent(xml)}`;
    logInfo(`plugin ${plugin.id} requires to add \n  ${xml} to your Info.plist to work`);
  }
}

async function logAndroidManifest (configElement: any, config: Config, plugin: Plugin) {
  const manifestPath = resolve(config.android.platformDir, 'app', 'src', 'main', 'AndroidManifest.xml');
  const xmlMeta = await readXML(manifestPath);
  const xmlElement = getXMLElement(configElement.$.parent, xmlMeta);
  let xmlEntries: Array<any> = [];
  const keys = Object.keys(configElement).filter(k  => k !== '$');
  await Promise.all(keys.map(async k => {
    let element = xmlElement[k];
    if (Object.getPrototypeOf(xmlElement) === Array.prototype) {
      element = xmlElement[0][k];
    }
    await Promise.all(configElement[k].map(async (e: any) => {
      if (element === undefined || !contains(element, e)) {
        xmlEntries.push(await buildXmlElement(e, k));
      }
    }));
  }));
  if (xmlEntries.length > 0) {
    logInfo(`plugin ${plugin.id} requires to add \n  ${xmlEntries.join("\n  ")} \nto your AndroidManifest.xml at ${getPathParts(configElement.$.parent).join(" ")} level to work\n`);
  }
}

async function buildXmlElement(configElement: any, rootName: string) {
  const xml2js = await import('xml2js');
  const builder = new xml2js.Builder({ headless: true, explicitRoot: false, rootName: rootName });
  return builder.buildObject(configElement);
}

async function buildConfigFileXml(configElement: any) {
  return buildXmlElement(configElement, 'config-file');
}

function getConfigFileTagContent(string: string) {
  return string.replace(/\<config-file.+\"\>|\<\/config-file>/g, '');
}

function getXMLElement(path: string, xml:any) {
  let xmlElement = xml;
  const parts = getPathParts(path);
  parts.map(part => {
    xmlElement = xmlElement[part];
  })
  return xmlElement;
}

function contains(a: Array<any>, obj: any) {
  for (var i = 0; i < a.length; i++) {
      if (JSON.stringify(a[i]) === JSON.stringify(obj)) {
          return true;
      }
  }
  return false;
}

function getPathParts(path: string) {
  const rootPath = "manifest";
  path = path.replace("/*", rootPath);
  let parts = path.split("/").filter(part => part !== '');
  if (parts.length > 1 || parts.includes(rootPath)) {
    return parts;
  }
  return [rootPath, path];
}

export async function checkAndInstallDependencies(config: Config, cordovaPlugins: Plugin[], platform: string) {
  let needsUpdate = false;
  await Promise.all(cordovaPlugins.map(async (p) => {
    const dependencies = p.xml['dependency'];
    if (dependencies) {
      await Promise.all(dependencies.map(async (dep: any) => {
        if (cordovaPlugins.filter(p => p.id === dep.$.id).length === 0) {
          console.log("installing missing dependency plugin "+dep.$.id);
          await runCommand(`npm install ${dep.$.id}`);
          needsUpdate = true;
        }
      }));
    }
  }));
  return needsUpdate;
}