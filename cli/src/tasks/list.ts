import { Config } from '../config';
import { logError, logInfo } from '../common';
import { allSerial } from '../util/promise';
import { Plugin, PluginType, getPluginType, getPlugins, printPlugins } from '../plugin';
import { getAndroidPlugins } from '../android/common';
import { getIOSPlugins } from '../ios/common';

export async function listCommand(config: Config, selectedPlatformName: string) {
  const platforms = config.selectPlatforms(selectedPlatformName);
  if (platforms.length === 0) {
    logInfo(`There are no platforms to list yet. Create one with \`capacitor create\`.`);
    return;
  }
  try {
    await allSerial(platforms.map(platformName => () => list(config, platformName)));
  } catch (e) {
    logError(e);
  }
}

export async function list(config: Config, platform: string) {

  const allPlugins = await getPlugins(config);
  let plugins: Plugin[] = [];
  if (platform === config.ios.name) {
    plugins = getIOSPlugins(allPlugins);
  } else if (platform === config.android.name) {
    plugins = getAndroidPlugins(allPlugins);
  } else if (platform === config.web.name || platform === config.electron.name) {
    logInfo(`Listing plugins for ${platform} is not possible`);
    return;
  } else {
    throw `Platform ${platform} is not valid.`;
  }

  const capacitorPlugins = plugins.filter(p => getPluginType(p, platform) === PluginType.Core);
  printPlugins(capacitorPlugins, platform);
  const cordovaPlugins = plugins.filter(p => getPluginType(p, platform) === PluginType.Cordova);
  printPlugins(cordovaPlugins, platform, 'cordova');
  const incompatibleCordovaPlugins = plugins.filter(p => getPluginType(p, platform) === PluginType.Incompatible);
  printPlugins(incompatibleCordovaPlugins, platform, 'incompatible');
}
