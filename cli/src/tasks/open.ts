import { openAndroid } from '../android/open';
import c from '../colors';
import {
  resolvePlatform,
  runPlatformHook,
  runTask,
  isValidPlatform,
  selectPlatforms,
  promptForPlatform,
} from '../common';
import type { Config } from '../definitions';
import { fatal, isFatal } from '../errors';
import { openIOS } from '../ios/open';
import { logger } from '../log';

export async function openCommand(
  config: Config,
  selectedPlatformName: string,
): Promise<void> {
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(
        config,
        selectedPlatformName,
        platformDir,
        'capacitor:open',
      );
    } else {
      logger.error(`Platform ${c.input(selectedPlatformName)} not found.`);
    }
  } else {
    const platforms = await selectPlatforms(config, selectedPlatformName);
    let platformName: string;
    if (platforms.length === 1) {
      platformName = platforms[0];
    } else {
      platformName = await promptForPlatform(
        platforms.filter(createOpenablePlatformFilter(config)),
        `Please choose a platform to open:`,
      );
    }

    try {
      await open(config, platformName);
    } catch (e) {
      if (!isFatal(e)) {
        fatal(e.stack ?? e);
      }

      throw e;
    }
  }
}

function createOpenablePlatformFilter(
  config: Config,
): (platform: string) => boolean {
  return platform =>
    platform === config.ios.name || platform === config.android.name;
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
