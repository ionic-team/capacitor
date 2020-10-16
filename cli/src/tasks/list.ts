import { getAndroidPlugins } from '../android/common';
import c from '../colors';
import { selectPlatforms } from '../common';
import type { Config } from '../definitions';
import { getIOSPlugins } from '../ios/common';
import { logger } from '../log';
import type { Plugin } from '../plugin';
import { PluginType, getPluginType, getPlugins, printPlugins } from '../plugin';
import { allSerial } from '../util/promise';

export async function listCommand(
  config: Config,
  selectedPlatformName: string,
): Promise<void> {
  const platforms = await selectPlatforms(config, selectedPlatformName);
  if (platforms.length === 0) {
    logger.info(
      `There are no platforms to list yet.\n` +
        `Add platforms with ${c.input('npx cap add')}.`,
    );
    return;
  }
  try {
    await allSerial(
      platforms.map(platformName => () => list(config, platformName)),
    );
  } catch (e) {
    logger.error(e.stack ?? e);
  }
}

export async function list(config: Config, platform: string): Promise<void> {
  const allPlugins = await getPlugins(config);
  let plugins: Plugin[] = [];
  if (platform === config.ios.name) {
    plugins = await getIOSPlugins(allPlugins);
  } else if (platform === config.android.name) {
    plugins = await getAndroidPlugins(allPlugins);
  } else if (platform === config.web.name) {
    logger.info(`Listing plugins for ${c.input(platform)} is not possible.`);
    return;
  } else {
    throw `Platform ${c.input(platform)} is not valid.`;
  }

  const capacitorPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Core,
  );
  printPlugins(capacitorPlugins, platform);
  const cordovaPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Cordova,
  );
  printPlugins(cordovaPlugins, platform, 'cordova');
  const incompatibleCordovaPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Incompatible,
  );
  printPlugins(incompatibleCordovaPlugins, platform, 'incompatible');
}
