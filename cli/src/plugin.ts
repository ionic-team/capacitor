import { EntryInfo } from 'readdirp';
import semver = require('semver');
import { Config } from './config';
import { dirname, join } from 'path';
import { log, logFatal, logWarn, readJSON, readXML, resolveNode, runTask } from './common';
import { existsAsync, readdirp } from './util/fs';

export const enum PluginType {
  Core,
  Cordova,
  Incompatible
}
export interface PluginManifest {
  ios: {
    src: string;
    doctor?: any[];
  };
  android: {
    src: string;
  };
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  rootPath: string;
  manifest?: PluginManifest;
  repository?: any;
  xml?: any;
  ios?: {
    name: string;
    type: PluginType;
    path: string;
  };
  android?: {
    type: PluginType;
    path: string
  };
}

interface DirToEntry { [key: string]: EntryInfo; }

const moduleRegexString = '^.*node_modules\/([a-z0-9\-\.\_\~]+|@[a-z0-9\-\.\_\~]+\/[a-z0-9\-\.\_\~]+)\/'
const isPackageJSON = new RegExp(moduleRegexString + 'package\.json$')
const isPluginXML = new RegExp(moduleRegexString + 'plugin\.xml$')

async function getInstalled(config: Config): Promise<Plugin[]> {
  const path = join(config.app.rootDir, 'node_modules');

  const packageEntries = await readdirp.promise(path, {fileFilter: (entry) => isPackageJSON.test(entry.fullPath)});
  const cordovaEntries = await readdirp.promise(path, {fileFilter: (entry) => isPluginXML.test(entry.fullPath)});
  const cordovaDirs = cordovaEntries.reduce(
    (obj, entry) => ({ ...obj, [dirname(entry.fullPath)]: entry }),
    {} as DirToEntry);

  const resolvePlugin = createPluginResolver(cordovaDirs);
  const nullablePlugins = await Promise.all(packageEntries.map(resolvePlugin));
  const plugins: Plugin[] = nullablePlugins.filter(p => p !== null) as Plugin[];
  return plugins;
}

export async function getPlugins(config: Config): Promise<Plugin[]> {
  return await runTask('Finding plugins', async () => {
    const plugins = await getInstalled(config);
    const pluginMap = plugins.reduce((o, p) => {
      (o[p.id] = o[p.id] || []).push(p);
      return o;
    }, {} as { [key: string]: Plugin[] });

    const returnedPlugins = [];
    for (let id in pluginMap) {
      const variations = pluginMap[id];
      if (variations.length > 1) {
        variations.sort((a, b) => semver.rcompare(a.version, b.version));
        const usedVersion = variations[0].version;
        log();
        logWarn(`Found multiple versions of plugin ${id} using ${usedVersion}.`);
        variations.slice(1).forEach((plugin) => {
          const otherVersion = plugin.version;
          const diff = semver.diff(usedVersion, otherVersion);
          if ( diff !== null ) { // if not equal
            logWarn(`  ${usedVersion} is a ${diff} change ahead of ${otherVersion}, which was found but unused.`);
          }
        });
      }
      returnedPlugins.push(variations[0]);
    }
    return returnedPlugins;
  });
}

export const createPluginResolver = (cordovaDirs: DirToEntry) =>
  async (packageEntry: EntryInfo): Promise<Plugin | null> => {

  const pkg = await readJSON(packageEntry.fullPath);
  const dir = dirname(packageEntry.fullPath);

  if (pkg.capacitor) {
    return {
      id: pkg.name,
      name: fixName(pkg.name),
      version: pkg.version,
      rootPath: dir,
      repository: pkg.repository,
      manifest: pkg.capacitor
    };
  } else if (cordovaDirs.hasOwnProperty(dir)) {
    const xml = await readXML(cordovaDirs[dir].fullPath);
    return {
      id: pkg.name,
      name: fixName(pkg.name),
      version: pkg.version,
      rootPath: dir,
      repository: pkg.repository,
      xml: xml.plugin
    };
  } else {
    return null;
  }
};

export function fixName(name: string): string {
  name = name
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/@/g, '')
    .replace(/_\w/g, (m) => m[1].toUpperCase());

  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function removeScope(name: string): string {
  var parts = name.split('/');
  if (parts.length > 1) {
    name = parts[parts.length - 1];
  }
  return name;
}

export function printPlugins(plugins: Plugin[], platform: string, type: string = 'capacitor') {
  const plural = plugins.length === 1 ? '' : 's';

  if (type === 'cordova') {
    log(`  Found ${plugins.length} Cordova plugin${plural} for ${platform}`);
  } else if (type === 'incompatible' && plugins.length > 0) {
    log(`  Found ${plugins.length} incompatible Cordova plugin${plural} for ${platform}, skipped install`);
  } else if (type === 'capacitor') {
    log(`  Found ${plugins.length} Capacitor plugin${plural} for ${platform}:`);
  }
  const chalk = require('chalk');
  for (let p of plugins) {
    log(`    ${chalk.bold(`${p.id}`)} (${chalk.green(p.version)})`);
  }
}

export function getPluginPlatform(p: Plugin, platform: string) {
  const platforms = p.xml.platform;
  if (platforms) {
    const platforms = p.xml.platform.filter(function(item: any) { return item.$.name === platform; });
    return platforms[0];
  }
  return [];
}

export function getPlatformElement(p: Plugin, platform: string, elementName: string) {
  const platformTag = getPluginPlatform(p, platform);
  if (platformTag) {
    const element = platformTag[elementName];
    if (element) {
      return element;
    }
  }
  return [];
}

export function getPluginType(p: Plugin, platform: string): PluginType {
  if (platform === 'ios') {
    return p.ios!.type;
  }
  if (platform === 'android') {
    return p.android!.type;
  }
  return PluginType.Core;
}

/**
 * Get each JavaScript Module for the given plugin
 */
export function getJSModules(p: Plugin, platform: string) {
  return getAllElements(p, platform, 'js-module');
}

/**
 * Get each asset tag for the given plugin
 */
export function getAssets(p: Plugin, platform: string) {
  return getAllElements(p, platform, 'asset');
}

export function getFilePath(config: Config, plugin: Plugin, path: string) {
  if (path.startsWith('node_modules')) {
    let pathSegments = path.split('/').slice(1);
    if (pathSegments[0].startsWith('@')) {
      pathSegments = [pathSegments[0] + '/' + pathSegments[1], ...pathSegments.slice(2)];
    }

    let filePath = resolveNode(config, ...pathSegments);
    if (!filePath) {
      throw new Error(`Can't resolve module ${pathSegments[0]}`);
    }

    return filePath;
  }
  return join(plugin.rootPath, path);
}

/**
 * For a given plugin, return all the plugin.xml elements with elementName, checking root and specified platform
 */
export function getAllElements(p: Plugin, platform: string, elementName: string) {
  let modules: Array<string> = [];
  if (p.xml[elementName]) {
    modules = modules.concat(p.xml[elementName]);
  }
  const platformModules = getPluginPlatform(p, platform);
  if (platformModules && platformModules[elementName]) {
    modules = modules.concat(platformModules[elementName]);
  }
  return modules;
}
