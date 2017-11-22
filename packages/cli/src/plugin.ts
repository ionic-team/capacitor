import { join, resolve } from "path";
import { readJSON } from "./common";
import { PLUGIN_PREFIX } from "./config";

export const enum PluginType {
  Code,
  Cocoapods,
}
export interface Plugin {
  id: string;
  name: string,
  rootPath: string;
  meta: any;
  ios?: {
    name: string;
    type: PluginType;
    path: string;
  }
  android?: {
    path: string
  }
}

export async function getPlugins(): Promise<Plugin[]> {
  const names = await getPluginNames();
  return await Promise.all(names.map(resolvePlugin));
}

export async function resolvePlugin(name: string): Promise<Plugin> {
  const rootPath = join('node_modules', name);
  const packagePath = join(rootPath, 'package.json');
  const meta = await readJSON(packagePath);
  return {
    id: name,
    name: fixName(name),
    rootPath: resolve(rootPath),
    meta: meta
  };
}

export async function getPluginNames(): Promise<string[]> {
  const json = await readJSON('package.json');
  const { dependencies } = json;
  if (!dependencies) {
    return [];
  }
  return Object.keys(dependencies)
    .filter(isAvocadoPlugin);
}

export function isAvocadoPlugin(fullname: string): boolean {
  const name = (fullname[0] === '@')
    ? fullname.split('/')[1]
    : fullname;

  if (name && name.startsWith(PLUGIN_PREFIX)) {
    return name.length > PLUGIN_PREFIX.length;
  } else {
    return false;
  }
}

export function fixName(name: string): string {
  name = name
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/@/g, '')
    .replace(/_\w/g, (m) => m[1].toUpperCase());

  return name.charAt(0).toUpperCase() + name.slice(1);
}
