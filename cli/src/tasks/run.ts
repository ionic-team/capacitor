import { columnar } from '@ionic/utils-terminal';

import { runAndroid } from '../android/run';
import c from '../colors';
import {
  isValidPlatform,
  resolvePlatform,
  runPlatformHook,
  selectPlatforms,
  promptForPlatform,
  getPlatformTargetName,
} from '../common';
import type { Config } from '../definitions';
import { runIOS } from '../ios/run';
import { logger, output, logFatal } from '../log';
import { getPlatformTargets } from '../util/native-run';

import { copy } from './copy';

export interface RunCommandOptions {
  list?: boolean;
  target?: string;
}

export async function runCommand(
  config: Config,
  selectedPlatformName: string,
  options: RunCommandOptions,
): Promise<void> {
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(platformDir, 'capacitor:run');
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

    if (options.list) {
      const targets = await getPlatformTargets(platformName);
      const rows = targets.map(t => [
        getPlatformTargetName(t),
        `${t.platform === 'ios' ? 'iOS' : 'API'} ${t.sdkVersion}`,
        t.id ?? '?',
      ]);

      output.write(
        `${columnar(rows, {
          headers: ['Name', 'API', 'Target ID'],
          vsep: ' ',
        })}\n`,
      );

      return;
    }

    try {
      await copy(config, platformName);
      await run(config, platformName, options);
    } catch (e) {
      logFatal(e.stack ?? e);
    }
  }
}

export async function run(
  config: Config,
  platformName: string,
  options: RunCommandOptions,
): Promise<void> {
  if (platformName == config.ios.name) {
    await runIOS(config, options);
  } else if (platformName === config.android.name) {
    await runAndroid(config, options);
  } else if (platformName === config.web.name) {
    return;
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

function createRunnablePlatformFilter(
  config: Config,
): (platform: string) => boolean {
  return platform =>
    platform === config.ios.name || platform === config.android.name;
}
