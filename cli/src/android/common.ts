import { runCommand } from '../common';
import { Config } from '../config';
import { getIncompatibleCordovaPlugins } from '../cordova';
import { mkdirs } from 'fs-extra';
import { convertToUnixPath, copyAsync, existsAsync, existsSync, readFileAsync, removeAsync, writeFileAsync } from '../util/fs';
import { join, resolve } from 'path';
import { Plugin, PluginType, getPluginPlatform } from '../plugin';

export async function gradleClean(config: Config) {
  await runCommand(`cd ${config.android.platformDir} && ./gradlew clean`);
}

export function getAndroidPlugins(allPlugins: Plugin[]): Plugin[] {
  const resolved = allPlugins.map(plugin => resolvePlugin(plugin));
  return resolved.filter(plugin => !!plugin) as Plugin[];
}

export function resolvePlugin(plugin: Plugin): Plugin | null {
  const platform = 'android';
  if (plugin.manifest && plugin.manifest.android) {
    let pluginFilesPath = plugin.manifest.android.src ? plugin.manifest.android.src : platform;
    const absolutePath = join(plugin.rootPath, pluginFilesPath, plugin.id);
    // Android folder shouldn't have subfolders, but they used to, so search for them for compatibility reasons
    if (existsSync(absolutePath)) {
      pluginFilesPath = join(platform, plugin.id);
    }
    plugin.android = {
      type: PluginType.Core,
      path: convertToUnixPath(pluginFilesPath)
    };
  } else if (plugin.xml) {
    plugin.android = {
      type: PluginType.Cordova,
      path: 'src/' + platform
    };
    if (getIncompatibleCordovaPlugins(platform).includes(plugin.id) || !getPluginPlatform(plugin, platform)) {
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
export async function editProjectSettingsAndroid(config: Config) {
  const appId = config.app.appId;
  const appName = config.app.appName;

  const manifestPath = resolve(config.app.rootDir, config.android.platformDir, 'app/src/main/AndroidManifest.xml');
  const buildGradlePath = resolve(config.app.rootDir, config.android.platformDir, 'app/build.gradle');

  let manifestContent = await readFileAsync(manifestPath, 'utf8');

  manifestContent = manifestContent.replace(/com.getcapacitor.myapp/g, `${appId}`);
  await writeFileAsync(manifestPath, manifestContent, 'utf8');

  const domainPath = appId.split('.').join('/');
  // Make the package source path to the new plugin Java file
  const newJavaPath = resolve(config.app.rootDir, config.android.platformDir, `app/src/main/java/${domainPath}`);

  if (!await existsAsync(newJavaPath)) {
    await mkdirs(newJavaPath);
  }

  await copyAsync(
    resolve(config.app.rootDir, config.android.platformDir, 'app/src/main/java/com/getcapacitor/myapp/MainActivity.java'),
    resolve(newJavaPath, 'MainActivity.java')
  );

  if (appId.split('.')[1] !== 'getcapacitor') {
    await removeAsync(resolve(config.app.rootDir, config.android.platformDir, 'app/src/main/java/com/getcapacitor'));
  }

  // Remove our template 'com' folder if their ID doesn't have it
  if (appId.split('.')[0] !== 'com') {
    await removeAsync(resolve(config.app.rootDir, config.android.platformDir, 'app/src/main/java/com/'));
  }

  // Update the package in the MainActivity java file
  const activityPath = resolve(config.app.rootDir, config.android.platformDir, newJavaPath, 'MainActivity.java');
  let activityContent = await readFileAsync(activityPath, 'utf8');

  activityContent = activityContent.replace(/package ([^;]*)/, `package ${appId}`);
  await writeFileAsync(activityPath, activityContent, 'utf8');

  // Update the applicationId in build.gradle
  let gradleContent = await readFileAsync(buildGradlePath, 'utf8');
  gradleContent = gradleContent.replace(/applicationId "[^"]+"/, `applicationId "${appId}"`);

  await writeFileAsync(buildGradlePath, gradleContent, 'utf8');

  // Update the settings in res/values/strings.xml
  const stringsPath = resolve(config.app.rootDir, config.android.platformDir, 'app/src/main/res/values/strings.xml');
  let stringsContent = await readFileAsync(stringsPath, 'utf8');
  stringsContent = stringsContent.replace(/com.getcapacitor.myapp/g, appId);
  stringsContent = stringsContent.replace(/My App/g, appName.replace(/'/g, `\\'`));

  await writeFileAsync(stringsPath, stringsContent);
}
