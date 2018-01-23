import { Config } from '../config';
import { isInstalled } from '../common';
import { readdirAsync } from '../util/fs';
import { join } from 'path';

import { Plugin, PluginType } from '../plugin';


export async function findXcodePath(config: Config): Promise<string | null> {
  try {
    const files = await readdirAsync(join(config.ios.platformDir, config.ios.nativeProjectName));
    const xcodeProject = files.find(file => file.endsWith('.xcworkspace'));
    if (xcodeProject) {
      return join(config.ios.platformDir, config.ios.nativeProjectName, xcodeProject);
    }
    return null;
  } catch {
    return null;
  }
}

export async function checkCocoaPods(config: Config): Promise<string | null> {
  config;
  if (!await isInstalled('pod')) {
    return 'cocoapods is not installed. For information: https://guides.cocoapods.org/using/getting-started.html#installation';
  }
  return null;
}

export async function checkIOSProject(config: Config): Promise<string | null> {
  const exists = config.platformDirExists('ios');
  if (exists === null) {
    return 'iOS was not created yet. Run `capacitor create ios`.';
  }
  return null;
}

export async function getIOSPlugins(allPlugins: Plugin[]): Promise<Plugin[]> {
  const resolved = await Promise.all(allPlugins.map(resolvePlugin));
  return resolved.filter(plugin => !!plugin) as Plugin[];
}

export async function resolvePlugin(plugin: Plugin): Promise<Plugin|null> {
  let iosPath = '';
  if (plugin.manifest && plugin.manifest.ios) {
    if (!plugin.manifest.ios.src) {
      throw 'capacitor.ios.src is missing';
    }
    iosPath = plugin.manifest.ios.src;
  } else if (plugin.xml) {
    iosPath = "src/ios";
  } else {
    return null;
  }
  try {
    plugin.ios = {
      name: plugin.name,
      type: PluginType.Code,
      path: iosPath
    };
    const files = await readdirAsync(join(plugin.rootPath, iosPath));
    const podSpec = files.find(file => file.endsWith('.podspec'));
    if (podSpec) {
      plugin.ios.type = PluginType.Cocoapods;
      plugin.ios.name = podSpec.split('.')[0];
    }
    if (plugin.xml) {
      plugin.ios.type = PluginType.Cordova;
    }
  } catch (e) {
    return null;
  }
  return plugin;
}
