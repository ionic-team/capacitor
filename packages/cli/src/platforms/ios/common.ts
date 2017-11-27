import { Plugin, PluginType } from '../../plugin';
import { existsAsync, isInstalled, readdirAsync, runCommand, writeFileAsync } from '../../common';
import { join, resolve } from 'path';
import { IOS_BASE_PROJECT_PATH, IOS_PATH } from '../../config';
import { cp, ls } from 'shelljs';
import { PROJECT_DIR } from '../../index';

export function findXcodePath(): string | null {
  for (let file of ls(IOS_PATH)) {
    if (file.endsWith('.xcworkspace')) {
      return join(IOS_PATH, file);
    }
  }
  return null;
}

export async function checkCocoaPods(): Promise<string | null> {
  if (!isInstalled('pod')) {
    return 'cocoapods is not installed. For information: https://guides.cocoapods.org/using/getting-started.html#installation';
  }
  return null;
}

export async function checkIOSProject(): Promise <string | null> {
  const exists = await isIOSAvailable();
  if (!exists) {
    return 'iOS was not created yet. Run `avocado start ios`.';
  }
  return null;
}

export async function checkNoIOSProject(): Promise <string | null> {
  const exists = await isIOSAvailable();
  if (exists) {
    return 'An iOS project already exist';
  }
  return null;
}

export function isIOSAvailable(): Promise<boolean> {
  return existsAsync(IOS_PATH);
}

export function getIOSBaseProject(): string {
  return resolve(PROJECT_DIR, IOS_BASE_PROJECT_PATH);
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
      plugin.ios.name = podSpec.split('.')[0];
    }
  } catch (e) {

  }
  return plugin;
}
