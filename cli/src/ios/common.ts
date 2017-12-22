import { Config } from '../config';
import { isInstalled, } from '../common';
import { join } from 'path';
import { readdirAsync, lstatAsync } from '../util/fs';

import { Plugin, PluginType } from '../plugin';


export async function findXcodePath(config: Config): Promise<string | null> {
  try {
    const iosFiles = await readdirAsync(config.ios.platformDir);

    const subFileSearches = iosFiles.map(async (file:any) => {
      let path = join(config.ios.platformDir, file);
      let stat = await lstatAsync(path);
      if(stat.isDirectory()) {
        let files = await readdirAsync(path);
        return {
          path: file,
          files: files
        }
      }
      return null;
    });
    const results = await Promise.all(subFileSearches);

    for(let directoryFiles of results) {
      if(!directoryFiles) { continue; }
      const xcodeProject = directoryFiles.files.find((file: string) => file.endsWith('.xcworkspace'));
      if (xcodeProject) {
        return join(config.ios.platformDir, directoryFiles.path, xcodeProject);
      }
    }
    return null;
  } catch(e) {
    throw e;
    //return null;
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
    return 'iOS was not created yet. Run `avocado create ios`.';
  }
  return null;
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
