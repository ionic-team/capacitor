import { Config } from '../config';
import { updateAndroid } from '../android/update';
import { updateIOS, updateIOSChecks } from '../ios/update';
import { allSerial } from '../util/promise';
import { CheckFunction, check, checkPackage, logFatal, logInfo } from '../common';
import { copySync, ensureDirSync, readFileAsync, removeSync, writeFileAsync } from '../util/fs';
import { join } from 'path';
import { Plugin, PluginType } from '../plugin';


export async function updateCommand(config: Config, selectedPlatformName: string) {
  const platforms = config.selectPlatforms(selectedPlatformName);
  if (platforms.length === 0) {
    logInfo(`There are no platforms to update yet. Create one with "capacitor create".`);
    return;
  }
  try {
    await check(
      config,
      [checkPackage, ...updateChecks(config, platforms)]
    );

    await allSerial(platforms.map(platformName => async () => await update(config, platformName, true)));
  } catch (e) {
    logFatal(e);
  }
}


export function updateChecks(config: Config, platforms: string[]): CheckFunction[] {
  const checks: CheckFunction[] = [];
  for (let platformName of platforms) {
    if (platformName === config.ios.name) {
      checks.push(...updateIOSChecks);
    } else if (platformName === config.android.name) {
      return [];
    } else {
      throw `Platform ${platformName} is not valid.`;
    }
  }
  return checks;
}


export async function update(config: Config, platformName: string, needsUpdate: boolean) {
  if (platformName === config.ios.name) {
    await updateIOS(config, needsUpdate);
  } else if (platformName === config.android.name) {
    await updateAndroid(config, needsUpdate);
  }
}


export async function copyPluginsJS(config: Config, plugins: Plugin[], platform: string) {
  const webDir = getwebDir(config, platform);
  const pluginsDir = join(webDir, 'plugins');
  const cordovaPluginsJSFile = join(webDir, 'cordova_plugins.js');
  removeSync(pluginsDir);
  removeSync(cordovaPluginsJSFile);
  const cordovaPlugins = plugins
    .filter(p => getPluginType(p, platform) === PluginType.Cordova);
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


export function generateCordovaPluginsJSFile(config: Config, plugins: Plugin[], platform: string) {
  let pluginModules: Array<string> = [];
  let pluginExports: Array<string> = [];
  plugins.map((p) => {
    const jsModules = getJSModules(p, platform);
    jsModules.map((jsModule: any) => {
      let clobbers: Array<string> = [];
      jsModule.clobbers.map((clobber: any)=> {
        clobbers.push(clobber.$.target);
      });
      pluginModules.push(`{
        "id": "${p.id}.${jsModule.$.name}",
        "file": "plugins/${p.id}/${jsModule.$.src}",
        "pluginId": "${p.id}",
        "clobbers": [
          "${clobbers.join(',')}"
        ]}`
      );
    });
    pluginExports.push(`"${p.id}": "${p.xml.$.version}"`);
  });
  return `
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      ${pluginModules.join(',')}
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      ${pluginExports.join(',\n')}
    };
    // BOTTOM OF METADATA
    });
    `;
}


function getJSModules(p: Plugin, platform: string) {
  let modules: Array<string> = [];
  if (p.xml["js-module"]) {
    modules = modules.concat(p.xml["js-module"]);
  }
  const platformModules = p.xml.platform.filter(function(item: any) { return item.$.name === platform; });
  if(platformModules[0]["js-module"]) {
    modules = modules.concat(platformModules[0]["js-module"]);
  }
  return modules;
}


function getwebDir(config: Config, platform: string): string {
  if (platform === "ios") {
    return config.ios.webDir;
  }
  if (platform === "android") {
    return config.android.webDir;
  }
  return "";
}


function getPluginType(p: Plugin, platform: string): PluginType {
  if (platform === "ios") {
    return p.ios!.type;
  }
  if (platform === "android") {
    return p.android!.type;
  }
  return PluginType.Code;
}