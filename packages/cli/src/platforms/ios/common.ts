import { PluginType, Plugin } from "../../plugin";
import { readdirAsync, writeFileAsync, runCommand, log, existsAsync, isInstalled } from "../../common";
import { join } from "path";
import { IOS_BASE_PROJECT_PATH, IOS_PATH } from "../../config";
import { ls, cp } from "shelljs";
import { PROJECT_DIR } from "../../index";

export async function checkIOSEnvironment() {
  if (!isInstalled('pod')) {
    throw 'cocoapods is not installed. For information: https://guides.cocoapods.org/using/getting-started.html#installation';
  }
}

export async function prepareIOS() {
  checkIOSEnvironment();

  const exist = await existsAsync(IOS_PATH);
  if (!exist) {
    cp('-R', getIOSBaseProject(), IOS_PATH);
  }
}

export function getIOSBaseProject(): string {
  console.log(PROJECT_DIR);
  return join(PROJECT_DIR, IOS_BASE_PROJECT_PATH);
}

export async function getIOSPlugins(allPlugins: Plugin[]): Promise<Plugin[]> {
  const resolved = await Promise.all(allPlugins.map(resolvePlugin));
  return resolved.filter(plugin => !!plugin.ios);
}

export async function resolvePlugin(plugin: Plugin): Promise<Plugin> {
  if (plugin.ios) {
    return plugin;
  }
  const iosPath = join(plugin.rootPath, plugin.meta.ios || 'native/ios');
  try {
    const files = await readdirAsync(iosPath);
    plugin.ios = {
      name: 'Plugin',
      type: PluginType.Code,
      path: iosPath
    };
    const podSpec = files.find(file => file.endsWith('.podspec'));
    if (podSpec) {
      plugin.ios.type = PluginType.Cocoapods;
      plugin.ios.name = podSpec.split('.')[0]
    }
  } catch (e) {

  }
  return plugin;
}
