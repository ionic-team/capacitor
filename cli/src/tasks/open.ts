import { openAndroid } from '../android/open';
import c from '../colors';
import { logFatal, resolvePlatform, runPlatformHook, runTask } from '../common';
import type { Config } from '../config';
import { openIOS } from '../ios/open';
import { logger } from '../log';

export async function openCommand(
  config: Config,
  selectedPlatformName: string,
): Promise<void> {
  if (selectedPlatformName && !config.isValidPlatform(selectedPlatformName)) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(platformDir, 'capacitor:open');
    } else {
      logger.error(`Platform ${c.input(selectedPlatformName)} not found.`);
    }
  } else {
    const platforms = config.selectPlatforms(selectedPlatformName);
    let platformName: string;
    if (platforms.length === 0) {
      logger.info(
        `There are no platforms to open yet.\n` +
          `Add platforms with ${c.input('npx cap add')}.`,
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
      logFatal(e.stack ?? e);
    }
  }
}

export async function open(
  config: Config,
  platformName: string,
): Promise<void> {
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
