import { join, resolve } from 'path';
import { log, logInfo, readJSON, readXML } from './common';


export const enum PluginType {
  Code,
  Cocoapods,
  Cordova,
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

export async function getPlugins(): Promise<Plugin[]> {
  const deps = await getDependencies();
  const plugins = await Promise.all(deps.map(resolvePlugin));
  return plugins.filter(p => !!p) as Plugin[];
}

export async function resolvePlugin(name: string): Promise<Plugin | null> {
  try {
    const rootPath = resolve('node_modules', name);
    const packagePath = join(rootPath, 'package.json');
    const meta = await readJSON(packagePath);
    if (!meta) {
      return null;
    }
    if (meta.capacitor) {
      return {
        id: name,
        name: fixName(name),
        version: meta.version,
        rootPath: rootPath,
        repository: meta.repository,
        manifest: meta.capacitor
      };
    }
    if (meta.cordova) {
      const pluginXMLPath = join(rootPath, 'plugin.xml');
      const xmlMeta = await readXML(pluginXMLPath);
      return {
        id: name,
        name: fixName(name),
        version: meta.version,
        rootPath: rootPath,
        repository: meta.repository,
        xml: xmlMeta.plugin
      };
    }
  } catch (e) { }
  return null;
}

export async function getDependencies(): Promise<string[]> {
  const json = await readJSON('package.json');
  const { dependencies } = json;
  if (!dependencies) {
    return [];
  }
  return Object.keys(dependencies);
}

export function fixName(name: string): string {
  name = name
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/@/g, '')
    .replace(/_\w/g, (m) => m[1].toUpperCase());

  return name.charAt(0).toUpperCase() + name.slice(1);
}


export function printPlugins(plugins: Plugin[]) {
  const chalk = require('chalk');
  const pluginNames = plugins.map(p => p.id).sort();
  if (pluginNames.length > 0) {
    log(`\n${chalk.bold(`Found ${pluginNames.length} additional Capacitor plugin(s):`)}
${pluginNames.map(p => `     ${p}`).join('\n')}
`);
  } else {
    logInfo('No Capacitor plugins found. That\'s ok, you can add more plugins later by npm installing them.');
  }
}

export function getPluginPlatform(p: Plugin, platform: string) {
  const platforms = p.xml.platform;
  if (platforms) {
    const platforms = p.xml.platform.filter(function(item: any) { return item.$.name === platform; });
    return platforms[0];
  }
  return null;
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
  return PluginType.Code;
}

/**
 * Get each JavaScript Module for the give nplugin
 */
export function getJSModules(p: Plugin, platform: string) {
  let modules: Array<string> = [];
  if (p.xml['js-module']) {
    modules = modules.concat(p.xml['js-module']);
  }
  const platformModules = getPluginPlatform(p, platform);
  if (platformModules && platformModules['js-module']) {
    modules = modules.concat(platformModules['js-module']);
  }
  return modules;
}
