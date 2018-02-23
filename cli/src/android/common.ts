import { Config } from '../config';
import { Plugin, PluginType } from '../plugin';
import { mkdirs, remove } from 'fs-extra';
import { cpAsync, existsAsync, readFileAsync, writeFileAsync } from '../util/fs';
import { dirname, join, resolve } from 'path';

export async function getAndroidPlugins(config: Config, allPlugins: Plugin[]): Promise<Plugin[]> {
  const resolved = await Promise.all(allPlugins.map(plugin => resolvePlugin(config, plugin)));
  return resolved.filter(plugin => !!plugin) as Plugin[];
}

export async function resolvePlugin(config: Config, plugin: Plugin): Promise<Plugin|null> {
  let androidPath = '';
  if (plugin.manifest && plugin.manifest.android) {
    if (!plugin.manifest.android.src) {
      throw 'capacitor.android.src is missing';
    }
    androidPath = plugin.manifest.android.src;
  } else if (plugin.xml) {
    androidPath = 'src/android';
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

export async function editProjectSettingsAndroid(config: Config, appName: string, appId: string) {
  const manifestPath = resolve(config.app.rootDir, config.android.platformDir, 'app/src/main/AndroidManifest.xml');
  const buildGradlePath = resolve(config.app.rootDir, config.android.platformDir, 'app/build.gradle');

  console.log(manifestPath);

  let manifestContent = await readFileAsync(manifestPath, 'utf-8');

  manifestContent = manifestContent.replace(/package="([^"]+)"/, `package="${appId}"`);
  await writeFileAsync(manifestPath, manifestContent, 'utf8');

  const domainPath = appId.split('.').join('/');
  // Make the package source path to the new plugin Java file
  const newJavaPath = resolve(config.app.rootDir, config.android.platformDir, `app/src/main/java/${domainPath}`);

  if (!await existsAsync(newJavaPath)) {
    await mkdirs(newJavaPath);
  }

  await cpAsync(
    resolve(config.app.rootDir, config.android.platformDir, 'app/src/main/java/com/getcapacitor/myapp/MainActivity.java'),
    resolve(newJavaPath, 'MainActivity.java')
  );

  await remove(resolve(config.app.rootDir, config.android.platformDir, 'app/src/main/java/com/getcapacitor'));

  // Remove our template 'com' folder if their ID doesn't have it
  if (appId.split('.')[0] !== 'com') {
    await remove(resolve(config.app.rootDir, config.android.platformDir, 'app/src/main/java/com/'));
  }
}