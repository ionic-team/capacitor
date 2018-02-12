import { join, resolve } from 'path';
import { logInfo, readJSON, readXML } from './common';


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
  rootPath: string;
  manifest?: PluginManifest;
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
        rootPath: rootPath,
        manifest: meta.capacitor
      };
    }
    if (meta.cordova) {
      const pluginXMLPath = join(rootPath, 'plugin.xml');
      const xmlMeta = await readXML(pluginXMLPath);
      return {
        id: name,
        name: fixName(name),
        rootPath: rootPath,
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


const CORE_PLUGINS = [
  'Camera', 'Network', 'Browser', 'Clipboard', 'Console', 'Device', 'Filesystem',
  'Geolocation', 'Haptics', 'LocalNotifications', 'Modals', 'Motion', 'PushNotifications',
  'Share', 'SplashScreen', 'StatusBar', 'Storage', 'Toast'
].sort();

export function printPlugins(plugins: Plugin[]) {
  console.log('Printing plugins');
  const chalk = require('chalk');
  const pluginNames = plugins.map(p => p.id).sort();
  const builtinPlugins = CORE_PLUGINS.map(p => `${chalk.dim('[core]')} ${p}`);
  pluginNames.push(...builtinPlugins);
  if (pluginNames.length > 0) {
    logInfo(`found ${pluginNames.length} native modules
${pluginNames.map(p => `     ${p}`).join('\n')}
`);
  } else {
    logInfo('no capacitor plugin was found, that\'s ok, you can add more plugins later');
  }
}
