import { Config } from '../config';
import { isInstalled } from '../common';
import { readdirAsync } from '../util/fs';
import { join } from 'path';

import { getPluginPlatform, Plugin, PluginType } from '../plugin';


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

export async function getIOSPlugins(config: Config, allPlugins: Plugin[]): Promise<Plugin[]> {
  const resolved = await Promise.all(allPlugins.map(p => resolvePlugin(config, p)));
  return resolved.filter(plugin => !!plugin) as Plugin[];
}

export async function resolvePlugin(config: Config, plugin: Plugin): Promise<Plugin|null> {
  let iosPath = '';
  if (plugin.manifest && plugin.manifest.ios) {
    iosPath = plugin.manifest.ios.src;
    if (!plugin.manifest.ios.src) {
      iosPath = 'ios';
    }
  } else if (plugin.xml && getPluginPlatform(plugin, 'ios')) {
    iosPath = 'src/ios';
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
    console.error('Unable to resolve plugin', e);
    return null;
  }
  return plugin;
}
