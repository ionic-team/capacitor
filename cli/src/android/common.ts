import { Plugin, PluginType } from '../plugin';

export async function getAndroidPlugins(allPlugins: Plugin[]): Promise<Plugin[]> {
  const resolved = await Promise.all(allPlugins.map(resolvePlugin));
  return resolved.filter(plugin => !!plugin) as Plugin[];
}

export async function resolvePlugin(plugin: Plugin): Promise<Plugin|null> {
  let androidPath = '';
  if (plugin.manifest && plugin.manifest.android) {
    if (!plugin.manifest.android.src) {
      throw 'capacitor.android.src is missing';
    }
    androidPath = plugin.manifest.android.src;
  } else if (plugin.xml) {
    androidPath = "src/android";
  } else {
    return null;
  }

  plugin.android = {
    type: PluginType.Code,
    path: androidPath
  };
  if (plugin.xml) {
    plugin.android.type = PluginType.Cordova;
  }

  return plugin;
}