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
import { fatal, isFatal } from '../errors';
import { runIOS } from '../ios/run';
import { logger, output } from '../log';
import { getPlatformTargets } from '../util/native-run';

import { sync } from './sync';

export interface RunCommandOptions {
  list?: boolean;
  target?: string;
  sync?: boolean;
}

export async function runCommand(
  config: Config,
  selectedPlatformName: string,
  options: RunCommandOptions,
): Promise<void> {
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(config, platformDir, 'capacitor:run');
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
      const outputTargets = targets.map(t => ({
        name: getPlatformTargetName(t),
        api: `${t.platform === 'ios' ? 'iOS' : 'API'} ${t.sdkVersion}`,
        id: t.id ?? '?',
      }));

      // TODO: make hidden commander option (https://github.com/tj/commander.js/issues/1106)
      if (process.argv.includes('--json')) {
        process.stdout.write(`${JSON.stringify(outputTargets)}\n`);
      } else {
        const rows = outputTargets.map(t => [t.name, t.api, t.id]);

        output.write(
          `${columnar(rows, {
            headers: ['Name', 'API', 'Target ID'],
            vsep: ' ',
          })}\n`,
        );
      }

      return;
    }

    try {
      if (options.sync) {
        await sync(config, platformName, false);
      }

      await run(config, platformName, options);
    } catch (e) {
      if (!isFatal(e)) {
        fatal(e.stack ?? e);
      }

      throw e;
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
