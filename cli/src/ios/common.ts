import { join, resolve } from 'path';

import c from '../colors';
import { isInstalled, checkCapacitorPlatform } from '../common';
import type { Config } from '../config';
import { getIncompatibleCordovaPlugins } from '../cordova';
import type { Plugin } from '../plugin';
import { PluginType, getPluginPlatform } from '../plugin';
import { readFileAsync, readdirAsync, writeFileAsync } from '../util/fs';

export async function findXcodePath(config: Config): Promise<string | null> {
  try {
    const files = await readdirAsync(
      join(config.ios.platformDir, config.ios.nativeProjectName),
    );
    const xcodeProject = files.find(file => file.endsWith('.xcworkspace'));
    if (xcodeProject) {
      return join(
        config.ios.platformDir,
        config.ios.nativeProjectName,
        xcodeProject,
      );
    }
    return null;
  } catch {
    return null;
  }
}

export async function checkIOSPackage(config: Config): Promise<string | null> {
  return checkCapacitorPlatform(config, 'ios');
}

export async function checkCocoaPods(config: Config): Promise<string | null> {
  if (!(await isInstalled('pod')) && config.cli.os === 'mac') {
    return (
      `CocoaPods is not installed.\n` +
      `See this install guide: ${c.strong(
        'https://guides.cocoapods.org/using/getting-started.html#installation',
      )}`
    );
  }
  return null;
}

export async function checkIOSProject(config: Config): Promise<string | null> {
  const exists = config.platformDirExists('ios');
  if (exists === null) {
    return (
      `${c.strong('ios')} platform has not been added yet.\n` +
      `Use ${c.input(`npx cap add ios`)} to add the platform to your project.`
    );
  }
  return null;
}

export function getIOSPlugins(allPlugins: Plugin[]): Plugin[] {
  const resolved = allPlugins.map(plugin => resolvePlugin(plugin));
  return resolved.filter(plugin => !!plugin) as Plugin[];
}

export function resolvePlugin(plugin: Plugin): Plugin | null {
  const platform = 'ios';
  if (plugin.manifest?.ios) {
    plugin.ios = {
      name: plugin.name,
      type: PluginType.Core,
      path: plugin.manifest.ios.src ?? platform,
    };
  } else if (plugin.xml) {
    plugin.ios = {
      name: plugin.name,
      type: PluginType.Cordova,
      path: 'src/' + platform,
    };
    if (
      getIncompatibleCordovaPlugins(platform).includes(plugin.id) ||
      !getPluginPlatform(plugin, platform)
    ) {
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
export async function editProjectSettingsIOS(config: Config): Promise<void> {
  const appId = config.app.appId;
  const appName = config.app.appName;

  const pbxPath = resolve(
    config.app.rootDir,
    config.ios.platformDir,
    config.ios.nativeProjectName,
    'App.xcodeproj/project.pbxproj',
  );
  const plistPath = resolve(
    config.app.rootDir,
    config.ios.platformDir,
    config.ios.nativeProjectName,
    'App/Info.plist',
  );

  let plistContent = await readFileAsync(plistPath, 'utf8');

  plistContent = plistContent.replace(
    /<key>CFBundleDisplayName<\/key>[\s\S]?\s+<string>([^<]*)<\/string>/,
    `<key>CFBundleDisplayName</key>\n        <string>${appName}</string>`,
  );

  let pbxContent = await readFileAsync(pbxPath, 'utf8');
  pbxContent = pbxContent.replace(
    /PRODUCT_BUNDLE_IDENTIFIER = ([^;]+)/g,
    `PRODUCT_BUNDLE_IDENTIFIER = ${appId}`,
  );

  await writeFileAsync(plistPath, plistContent, 'utf8');
  await writeFileAsync(pbxPath, pbxContent, 'utf8');
}
