import { Config } from '../config';
import { electronWarning, hasYarn, log, logError, logFatal, logInfo, resolvePlatform, runPlatformHook, runTask } from '../common';
import { openAndroid } from '../android/open';
import { openElectron } from '../electron/open';
import { openIOS } from '../ios/open';

export async function openCommand(config: Config, selectedPlatformName: string) {
  if (selectedPlatformName && !config.isValidPlatform(selectedPlatformName)) {
    const platformFolder = resolvePlatform(config, selectedPlatformName);
    if (platformFolder) {
      const result = await runPlatformHook(`cd "${platformFolder}" && ${await hasYarn(config) ? 'yarn' : 'npm'} run capacitor:open`);
      log(result);
    } else {
      logError(`platform ${selectedPlatformName} not found`);
    }
  } else {
    const platforms = config.selectPlatforms(selectedPlatformName);
    let platformName: string;
    if (platforms.length === 0) {
      logInfo(`There are no platforms to open yet. Create one with "capacitor add".`);
      return;
    } else if (platforms.length === 1) {
      platformName = platforms[0];
    } else {
      platformName = await config.askPlatform('', `Please choose a platform to open:`);
    }

    try {
      await open(config, platformName);
    } catch (e) {
      logFatal(e);
    }
  }
}


export async function open(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await runTask('Opening the Xcode workspace...', () => {
      return openIOS(config);
    });
  } else if (platformName === config.android.name) {
    return openAndroid(config);
  } else if (platformName === config.web.name) {
    return Promise.resolve();
  } else if (platformName === config.electron.name) {
    electronWarning();
    return openElectron(config);
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}
