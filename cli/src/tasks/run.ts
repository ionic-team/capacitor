import { runAndroid } from '../android/run';
import c from '../colors';
import {
  isValidPlatform,
  resolvePlatform,
  runPlatformHook,
  selectPlatforms,
  promptForPlatform,
  logFatal,
} from '../common';
import type { Config } from '../definitions';
import { runIOS } from '../ios/run';
import { logger } from '../log';

import { copy } from './copy';

export async function runCommand(
  config: Config,
  selectedPlatformName: string,
): Promise<void> {
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(platformDir, 'capacitor:update');
    } else {
      logger.error(`Platform ${c.input(selectedPlatformName)} not found.`);
    }
  } else {
    const platforms = await selectPlatforms(config, selectedPlatformName);
    let platformName: string;
    if (platforms.length === 0) {
      logger.info(
        `There are no platforms to run yet.\n` +
          `Add platforms with ${c.input('npx cap add')}.`,
      );
      return;
    } else if (platforms.length === 1) {
      platformName = platforms[0];
    } else {
      platformName = await promptForPlatform(
        platforms.filter(createRunnablePlatformFilter(config)),
        `Please choose a platform to run:`,
      );
    }

    try {
      await copy(config, platformName);
      await run(config, platformName);
    } catch (e) {
      logFatal(e.stack ?? e);
    }
  }
}

function createRunnablePlatformFilter(
  config: Config,
): (platform: string) => boolean {
  return platform =>
    platform === config.ios.name || platform === config.android.name;
}

export async function run(config: Config, platformName: string): Promise<void> {
  if (platformName == config.ios.name) {
    await runIOS(config);
  } else if (platformName === config.android.name) {
    await runAndroid(config);
  } else if (platformName === config.web.name) {
    return;
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}
