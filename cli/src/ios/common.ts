import { readFile, writeFile } from '@ionic/utils-fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

import c from '../colors';
import { checkCapacitorPlatform } from '../common';
import { getIncompatibleCordovaPlugins } from '../cordova';
import { OS } from '../definitions';
import type { Config } from '../definitions';
import { logger } from '../log';
import { PluginType, getPluginPlatform } from '../plugin';
import type { Plugin } from '../plugin';
import { isInstalled, runCommand } from '../util/subprocess';

export async function checkIOSPackage(config: Config): Promise<string | null> {
  return checkCapacitorPlatform(config, 'ios');
}

function execBundler() {
  try {
    const bundleOutput = execSync('bundle &> /dev/null ; echo $?');
    return parseInt(bundleOutput.toString());
  } catch (e: any) {
    return -1;
  }
}

export async function checkBundler(config: Config): Promise<string | null> {
  if (config.cli.os === OS.Mac) {
    let bundlerResult = execBundler();
    if (bundlerResult === 1) {
      // Bundler version is outdated
      logger.info(`Using ${c.strong('Gemfile')}: Bundler update needed...`);
      await runCommand('gem', ['install', 'bundler']);
      bundlerResult = execBundler();
    }
    if (bundlerResult === 0) {
      // Bundler in use, all gems current
      logger.info(`Using ${c.strong('Gemfile')}: RubyGems bundle installed`);
    }
  }
  return null;
}

export async function checkCocoaPods(config: Config): Promise<string | null> {
  if (
    !(await isInstalled(await config.ios.podPath)) &&
    config.cli.os === OS.Mac
  ) {
    return (
      `CocoaPods is not installed.\n` +
      `See this install guide: ${c.strong(
        'https://capacitorjs.com/docs/getting-started/environment-setup#homebrew',
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
  const appName = config.app.appName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

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
