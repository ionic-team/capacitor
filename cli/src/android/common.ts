import {
  copy,
  remove,
  mkdirp,
  readFile,
  pathExists,
  writeFile,
} from '@ionic/utils-fs';
import { join, resolve } from 'path';

import { checkCapacitorPlatform } from '../common';
import { getIncompatibleCordovaPlugins } from '../cordova';
import type { Config } from '../definitions';
import { PluginType, getPluginPlatform } from '../plugin';
import type { Plugin } from '../plugin';
import { convertToUnixPath } from '../util/fs';

export async function checkAndroidPackage(
  config: Config,
): Promise<string | null> {
  return checkCapacitorPlatform(config, 'android');
}

export async function getAndroidPlugins(
  allPlugins: Plugin[],
): Promise<Plugin[]> {
  const resolved = await Promise.all(
    allPlugins.map(async plugin => await resolvePlugin(plugin)),
  );
  return resolved.filter((plugin): plugin is Plugin => !!plugin);
}

export async function resolvePlugin(plugin: Plugin): Promise<Plugin | null> {
  const platform = 'android';
  if (plugin.manifest?.android) {
    let pluginFilesPath = plugin.manifest.android.src
      ? plugin.manifest.android.src
      : platform;
    const absolutePath = join(plugin.rootPath, pluginFilesPath, plugin.id);
    // Android folder shouldn't have subfolders, but they used to, so search for them for compatibility reasons
    if (await pathExists(absolutePath)) {
      pluginFilesPath = join(platform, plugin.id);
    }
    plugin.android = {
      type: PluginType.Core,
      path: convertToUnixPath(pluginFilesPath),
    };
  } else if (plugin.xml) {
    plugin.android = {
      type: PluginType.Cordova,
      path: 'src/' + platform,
    };
    if (
      getIncompatibleCordovaPlugins(platform).includes(plugin.id) ||
      !getPluginPlatform(plugin, platform)
    ) {
      plugin.android.type = PluginType.Incompatible;
    }
  } else {
    return null;
  }
  return plugin;
}

/**
 * Update an Android project with the desired app name and appId.
 * This is a little trickier for Android because the appId becomes
 * the package name.
 */
export async function editProjectSettingsAndroid(
  config: Config,
): Promise<void> {
  const appId = config.app.appId;
  const appName = config.app.appName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");

  const manifestPath = resolve(
    config.android.srcMainDirAbs,
    'AndroidManifest.xml',
  );
  const buildGradlePath = resolve(config.android.appDirAbs, 'build.gradle');

  let manifestContent = await readFile(manifestPath, { encoding: 'utf-8' });

  manifestContent = manifestContent.replace(
    /com.getcapacitor.myapp/g,
    `${appId}`,
  );
  await writeFile(manifestPath, manifestContent, { encoding: 'utf-8' });

  const domainPath = appId.split('.').join('/');
  // Make the package source path to the new plugin Java file
  const newJavaPath = resolve(
    config.android.srcMainDirAbs,
    `java/${domainPath}`,
  );

  if (!(await pathExists(newJavaPath))) {
    await mkdirp(newJavaPath);
  }

  await copy(
    resolve(
      config.android.srcMainDirAbs,
      'java/com/getcapacitor/myapp/MainActivity.java',
    ),
    resolve(newJavaPath, 'MainActivity.java'),
  );

  if (appId.split('.')[1] !== 'getcapacitor') {
    await remove(
      resolve(config.android.srcMainDirAbs, 'java/com/getcapacitor'),
    );
  }

  // Remove our template 'com' folder if their ID doesn't have it
  if (appId.split('.')[0] !== 'com') {
    await remove(resolve(config.android.srcMainDirAbs, 'java/com/'));
  }

  // Update the package in the MainActivity java file
  const activityPath = resolve(newJavaPath, 'MainActivity.java');
  let activityContent = await readFile(activityPath, { encoding: 'utf-8' });

  activityContent = activityContent.replace(
    /package ([^;]*)/,
    `package ${appId}`,
  );
  await writeFile(activityPath, activityContent, { encoding: 'utf-8' });

  // Update the applicationId in build.gradle
  let gradleContent = await readFile(buildGradlePath, { encoding: 'utf-8' });
  gradleContent = gradleContent.replace(
    /applicationId "[^"]+"/,
    `applicationId "${appId}"`,
  );

  await writeFile(buildGradlePath, gradleContent, { encoding: 'utf-8' });

  // Update the settings in res/values/strings.xml
  const stringsPath = resolve(config.android.resDirAbs, 'values/strings.xml');
  let stringsContent = await readFile(stringsPath, { encoding: 'utf-8' });
  stringsContent = stringsContent.replace(/com.getcapacitor.myapp/g, appId);
  stringsContent = stringsContent.replace(/My App/g, appName);

  await writeFile(stringsPath, stringsContent);
}
