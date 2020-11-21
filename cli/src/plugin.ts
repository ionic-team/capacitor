import { readJSON } from '@ionic/utils-fs';
import { dirname, join } from 'path';

import c from './colors';
import type { Config } from './definitions';
import { logger, logFatal } from './log';
import { resolveNode } from './util/node';
import { readXML } from './util/xml';

export const enum PluginType {
  Core,
  Cordova,
  Incompatible,
}
export interface PluginManifest {
  ios: {
    src: string;
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
    path: string;
  };
}

export async function getPlugins(config: Config): Promise<Plugin[]> {
  const deps = getDependencies(config);
  const plugins = await Promise.all(
    deps.map(async p => resolvePlugin(config, p)),
  );
  return plugins.filter(p => !!p) as Plugin[];
}

export async function resolvePlugin(
  config: Config,
  name: string,
): Promise<Plugin | null> {
  try {
    const packagePath = resolveNode(config.app.rootDir, name, 'package.json');
    if (!packagePath) {
      logFatal(
        `Unable to find node_modules/${name}.\n` +
          `Are you sure ${c.strong(name)} is installed?`,
      );
    }

    const rootPath = dirname(packagePath);
    const meta = await readJSON(packagePath);
    if (!meta) {
      return null;
    }
    if (meta.capacitor) {
      return {
        id: name,
        name: fixName(name),
        version: meta.version,
        rootPath,
        repository: meta.repository,
        manifest: meta.capacitor,
      };
    }
    const pluginXMLPath = join(rootPath, 'plugin.xml');
    const xmlMeta = await readXML(pluginXMLPath);
    return {
      id: name,
      name: fixName(name),
      version: meta.version,
      rootPath: rootPath,
      repository: meta.repository,
      xml: xmlMeta.plugin,
    };
  } catch (e) {
    // ignore
  }
  return null;
}

export function getDependencies(config: Config): string[] {
  const dependencies = config.app.package.dependencies ?? [];
  const devDependencies = config.app.package.devDependencies ?? [];
  return Object.keys(dependencies).concat(Object.keys(devDependencies));
}

export function fixName(name: string): string {
  name = name
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/@/g, '')
    .replace(/_\w/g, m => m[1].toUpperCase());

  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function printPlugins(
  plugins: Plugin[],
  platform: string,
  type: 'capacitor' | 'cordova' | 'incompatible' = 'capacitor',
): void {
  if (plugins.length === 0) {
    return;
  }

  let msg: string;
  const plural = plugins.length === 1 ? '' : 's';

  switch (type) {
    case 'cordova':
      msg = `Found ${plugins.length} Cordova plugin${plural} for ${c.strong(
        platform,
      )}:\n`;
      break;
    case 'incompatible':
      msg = `Found ${
        plugins.length
      } incompatible Cordova plugin${plural} for ${c.strong(
        platform,
      )}, skipped install:\n`;
      break;
    case 'capacitor':
      msg = `Found ${plugins.length} Capacitor plugin${plural} for ${c.strong(
        platform,
      )}:\n`;
      break;
  }

  msg += plugins.map(p => `${p.id}${c.weak(`@${p.version}`)}`).join('\n');

  logger.info(msg);
}

export function getPluginPlatform(p: Plugin, platform: string): any {
  const platforms = p.xml.platform;
  if (platforms) {
    const platforms = p.xml.platform.filter(function (item: any) {
      return item.$.name === platform;
    });
    return platforms[0];
  }
  return [];
}

export function getPlatformElement(
  p: Plugin,
  platform: string,
  elementName: string,
): any {
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
export function getJSModules(p: Plugin, platform: string): any {
  return getAllElements(p, platform, 'js-module');
}

/**
 * Get each asset tag for the given plugin
 */
export function getAssets(p: Plugin, platform: string): any {
  return getAllElements(p, platform, 'asset');
}

export function getFilePath(
  config: Config,
  plugin: Plugin,
  path: string,
): string {
  if (path.startsWith('node_modules')) {
    let pathSegments = path.split('/').slice(1);
    if (pathSegments[0].startsWith('@')) {
      pathSegments = [
        pathSegments[0] + '/' + pathSegments[1],
        ...pathSegments.slice(2),
      ];
    }

    const filePath = resolveNode(config.app.rootDir, ...pathSegments);
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
export function getAllElements(
  p: Plugin,
  platform: string,
  elementName: string,
): any {
  let modules: string[] = [];
  if (p.xml[elementName]) {
    modules = modules.concat(p.xml[elementName]);
  }
  const platformModules = getPluginPlatform(p, platform);
  if (platformModules?.[elementName]) {
    modules = modules.concat(platformModules[elementName]);
  }
  return modules;
}
