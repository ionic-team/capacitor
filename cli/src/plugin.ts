import { join, resolve } from 'path';
import { readJSON } from './common';
import { PACKAGE_JSON } from './config';

export const enum PluginType {
  Code,
  Cocoapods,
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
  manifest: PluginManifest;
  ios?: {
    name: string;
    type: PluginType;
    path: string;
  };
  android?: {
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
    const packagePath = join(rootPath, PACKAGE_JSON);
    const meta = await readJSON(packagePath);
    if (!meta || !meta.avocado) {
      return null;
    }
    return {
      id: name,
      name: fixName(name),
      rootPath: rootPath,
      manifest: meta.avocado
    };
  } catch (e) { }
  return null;
}

export async function getDependencies(): Promise<string[]> {
  const json = await readJSON(PACKAGE_JSON);
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
