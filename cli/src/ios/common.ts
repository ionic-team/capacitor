import { readFile, writeFile } from '@ionic/utils-fs';
import { resolve } from 'path';

import c from '../colors';
import { checkCapacitorPlatform } from '../common';
import { getIncompatibleCordovaPlugins } from '../cordova';
import { OS } from '../definitions';
import type { Config } from '../definitions';
import { PluginType, getPluginPlatform } from '../plugin';
import type { Plugin } from '../plugin';
import { isInstalled } from '../util/subprocess';

export async function checkIOSPackage(config: Config): Promise<string | null> {
  return checkCapacitorPlatform(config, 'ios');
}

export async function checkCocoaPods(config: Config): Promise<string | null> {
  if (!(await isInstalled(config.ios.podPath)) && config.cli.os === OS.Mac) {
    return (
      `CocoaPods is not installed.\n` +
      `See this install guide: ${c.strong(
        'https://guides.cocoapods.org/using/getting-started.html#installation',
      )}`
    );
  }
  return null;
}

export async function getIOSPlugins(allPlugins: Plugin[]): Promise<Plugin[]> {
  const resolved = await Promise.all(
    allPlugins.map(async plugin => await resolvePlugin(plugin)),
  );
  return resolved.filter((plugin): plugin is Plugin => !!plugin);
}

export async function resolvePlugin(plugin: Plugin): Promise<Plugin | null> {
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

  const pbxPath = `${config.ios.nativeXcodeProjDirAbs}/project.pbxproj`;
  const plistPath = resolve(config.ios.nativeTargetDirAbs, 'Info.plist');

  let plistContent = await readFile(plistPath, { encoding: 'utf-8' });

  plistContent = plistContent.replace(
    /<key>CFBundleDisplayName<\/key>[\s\S]?\s+<string>([^<]*)<\/string>/,
    `<key>CFBundleDisplayName</key>\n        <string>${appName}</string>`,
  );

  let pbxContent = await readFile(pbxPath, { encoding: 'utf-8' });
  pbxContent = pbxContent.replace(
    /PRODUCT_BUNDLE_IDENTIFIER = ([^;]+)/g,
    `PRODUCT_BUNDLE_IDENTIFIER = ${appId}`,
  );

  await writeFile(plistPath, plistContent, { encoding: 'utf-8' });
  await writeFile(pbxPath, pbxContent, { encoding: 'utf-8' });
}

export function shouldPodInstall(
  config: Config,
  platformName: string,
): boolean {
  // Don't run pod install or xcodebuild if not on macOS
  if (config.cli.os !== OS.Mac && platformName === 'ios') {
    return false;
  }
  return true;
}
