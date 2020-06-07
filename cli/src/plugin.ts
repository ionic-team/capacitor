import readInstalled = require('read-installed');
import semver = require('semver');
import { Config } from './config';
import { join } from 'path';
import { log, logFatal, logWarn, readJSON, readXML, resolveNode, runTask } from './common';
import { existsAsync } from './util/fs';

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

function flatten(pkg: any) {
  let seen: any[] = [];
  const _flatten = (pkg: any): any[] => {
    if (pkg.constructor !== Object || seen.indexOf(pkg) >= 0) return [];
    seen.push(pkg);
    if (!Object.keys(pkg.dependencies)) return [pkg];
    return [ pkg, ...([] as any[]).concat(...Object.values(pkg.dependencies).map(_flatten)) ];
  };
  return _flatten(pkg);
}


function getInstalled(config: Config): Promise<any> {
  return new Promise((resolve, reject) => {
    readInstalled(config.app.rootDir, { dev: true },
      (err: Error, tree) => err ? reject(err) : resolve(tree));
  });
}

export async function getPlugins(config: Config): Promise<Plugin[]> {
  return await runTask('Finding plugins', async () => {
    const rootPkg = await getInstalled(config);
    const nullablePlugins = await Promise.all(flatten(rootPkg).map(resolvePlugin));
    const plugins: Plugin[] = nullablePlugins.filter(p => p !== null) as Plugin[];

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

export async function resolvePlugin(pkg: any): Promise<Plugin | null> {
  try {
    if (pkg.capacitor) {
      return {
        id: pkg.name,
        name: fixName(pkg.name),
        version: pkg.version,
        rootPath: pkg.path,
        repository: pkg.repository,
        manifest: pkg.capacitor
      };
    }
    const xmlPath = join(pkg.path, 'plugin.xml');
    if (await existsAsync(xmlPath)) return null;
    const xml = await readXML(xmlPath);
    if (xml) {
      return {
        id: pkg.name,
        name: fixName(pkg.name),
        version: pkg.version,
        rootPath: pkg.path,
        repository: pkg.repository,
        xml: xml.plugin
      };
    }
  } catch (_) {}
  return null;
}

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
