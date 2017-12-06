import { Config } from '../config';
import { existsAsync, isInstalled, readdirAsync } from '../common';
import { join } from 'path';
import { ls } from 'shelljs';
import { Plugin, PluginType } from '../plugin';


export function findXcodePath(config: Config): string | null {
  for (let file of ls(config.ios.platformDir)) {
    if (file.endsWith('.xcworkspace')) {
      return join(config.ios.platformDir, file);
    }
  }
  return null;
}

export async function checkCocoaPods(config: Config): Promise<string | null> {
  config;
  if (!isInstalled('pod')) {
    return 'cocoapods is not installed. For information: https://guides.cocoapods.org/using/getting-started.html#installation';
  }
  return null;
}

export async function checkIOSProject(config: Config): Promise <string | null> {
  const exists = await isIOSAvailable(config);
  if (!exists) {
    return 'iOS was not created yet. Run `avocado start ios`.';
  }
  return null;
}

export async function checkNoIOSProject(config: Config): Promise <string | null> {
  const exists = await isIOSAvailable(config);
  if (exists) {
    return 'An iOS project already exist';
  }
  return null;
}

export function isIOSAvailable(config: Config): Promise<boolean> {
  return existsAsync(config.ios.name);
}

export async function getIOSPlugins(allPlugins: Plugin[]): Promise<Plugin[]> {
  const resolved = await Promise.all(allPlugins.map(resolvePlugin));
  return resolved.filter(plugin => !!plugin) as Plugin[];
}

export async function resolvePlugin(plugin: Plugin): Promise<Plugin|null> {
  const iosManifest = plugin.manifest.ios;
  if (!iosManifest) {
    return null;
  }
  try {
    if (!iosManifest.src) {
      throw 'avocado.ios.path is missing';
    }

    const iosPath = join(plugin.rootPath, iosManifest.src);
    plugin.ios = {
      name: plugin.name,
      type: PluginType.Code,
      path: iosPath
    };
    const files = await readdirAsync(iosPath);
    const podSpec = files.find(file => file.endsWith('.podspec'));
    if (podSpec) {
      plugin.ios.type = PluginType.Cocoapods;
      plugin.ios.name = podSpec.split('.')[0];
    }
  } catch (e) {
    return null;
  }
  return plugin;
}
