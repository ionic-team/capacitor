import { Config } from '../config';
import {
  log,
  logError,
  logFatal,
  logInfo,
  resolvePlatform,
  runPlatformHook,
  runTask,
} from '../common';
import { openAndroid } from '../android/open';
import { openIOS } from '../ios/open';

export async function openCommand(
  config: Config,
  selectedPlatformName: string,
) {
  if (selectedPlatformName && !config.isValidPlatform(selectedPlatformName)) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(platformDir, 'capacitor:open');
    } else {
      logError(`platform ${selectedPlatformName} not found`);
    }
  } else {
    const platforms = config.selectPlatforms(selectedPlatformName);
    let platformName: string;
    if (platforms.length === 0) {
      logInfo(
        `There are no platforms to open yet. Create one with "capacitor add".`,
      );
      return;
    } else if (platforms.length === 1) {
      platformName = platforms[0];
    } else {
      platformName = await config.askPlatform(
        '',
        `Please choose a platform to open:`,
      );
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
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}
