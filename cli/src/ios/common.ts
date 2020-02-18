import { Config } from '../config';
import { isInstalled } from '../common';
import { readFileAsync, readdirAsync, writeFileAsync } from '../util/fs';
import { join, resolve } from 'path';
import { getIncompatibleCordovaPlugins } from '../cordova';
import { Plugin, PluginType, getPluginPlatform } from '../plugin';


export async function findXcodePath(config: Config): Promise<string | null> {
  try {
    const files = await readdirAsync(join(config.ios.platformDir, config.ios.nativeProjectName));
    const xcodeProject = files.find(file => file.endsWith('.xcworkspace'));
    if (xcodeProject) {
      return join(config.ios.platformDir, config.ios.nativeProjectName, xcodeProject);
    }
    return null;
  } catch {
    return null;
  }
}

export async function checkCocoaPods(config: Config): Promise<string | null> {
  config;
  if (!await isInstalled('pod') && config.cli.os === 'mac') {
    return 'cocoapods is not installed. For information: https://guides.cocoapods.org/using/getting-started.html#installation';
  }
  return null;
}

export async function checkIOSProject(config: Config): Promise<string | null> {
  const exists = config.platformDirExists('ios');
  if (exists === null) {
    return 'iOS was not created yet. Run `capacitor create ios`.';
  }
  return null;
}

export function getIOSPlugins(allPlugins: Plugin[]): Plugin[] {
  const resolved = allPlugins.map(plugin => resolvePlugin(plugin));
  return resolved.filter(plugin => !!plugin) as Plugin[];
}

export function resolvePlugin(plugin: Plugin): Plugin | null {
  const platform = 'ios';
  if (plugin.manifest && plugin.manifest.ios) {
    plugin.ios = {
      name: plugin.name,
      type: PluginType.Core,
      path: plugin.manifest.ios.src ? plugin.manifest.ios.src : platform
    };
  } else if (plugin.xml) {
    plugin.ios = {
      name: plugin.name,
      type: PluginType.Cordova,
      path: 'src/' + platform
    };
    if (getIncompatibleCordovaPlugins(platform).includes(plugin.id) || !getPluginPlatform(plugin, platform)) {
      plugin.ios.type = PluginType.Incompatible;
    }
  } else {
    return null;
  }
  return plugin;
}

/**
 * Update the native project files with the desired app id and app name
 */
export async function editProjectSettingsIOS(config: Config) {
  const appId = config.app.appId;
  const appName = config.app.appName;

  const pbxPath = resolve(config.app.rootDir, config.ios.platformDir, config.ios.nativeProjectName, 'App\.xcodeproj/project.pbxproj');
  const plistPath = resolve(config.app.rootDir, config.ios.platformDir, config.ios.nativeProjectName, 'App/Info.plist');

  let plistContent = await readFileAsync(plistPath, 'utf8');

  plistContent = plistContent.replace(
    /<key>CFBundleDisplayName<\/key>[\s\S]?\s+<string>([^\<]*)<\/string>/,
    `<key>CFBundleDisplayName</key>\n        <string>${appName}</string>`);

  let pbxContent = await readFileAsync(pbxPath, 'utf8');
  pbxContent = pbxContent.replace(
    /PRODUCT_BUNDLE_IDENTIFIER = ([^;]+)/g,
    `PRODUCT_BUNDLE_IDENTIFIER = ${appId}`);

  await writeFileAsync(plistPath, plistContent, 'utf8');
  await writeFileAsync(pbxPath, pbxContent, 'utf8');
}
