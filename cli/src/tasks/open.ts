import { openAndroid } from '../android/open.js';
import c from '../colors.js';
import {
  resolvePlatform,
  runPlatformHook,
  runTask,
  isValidPlatform,
  selectPlatforms,
  promptForPlatform,
} from '../common.js';
import type { Config } from '../definitions.js';
import { fatal, isFatal } from '../errors.js';
import { openIOS } from '../ios/open.js';
import { logger } from '../log.js';

export async function openCommand(config: Config, selectedPlatformName: string): Promise<void> {
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(config, selectedPlatformName, platformDir, 'capacitor:open');
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
    } catch (e: any) {
      if (!isFatal(e)) {
        fatal(e.stack ?? e);
      }

      throw e;
    }
  }
}

function createOpenablePlatformFilter(config: Config): (platform: string) => boolean {
  return (platform) => platform === config.ios.name || platform === config.android.name;
}

export async function open(config: Config, platformName: string): Promise<void> {
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
