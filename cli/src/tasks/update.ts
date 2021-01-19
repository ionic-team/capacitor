import { updateAndroid } from '../android/update';
import c from '../colors';
import type { CheckFunction } from '../common';
import {
  check,
  checkPackage,
  resolvePlatform,
  runPlatformHook,
  runTask,
  selectPlatforms,
  isValidPlatform,
} from '../common';
import type { Config } from '../definitions';
import { fatal, isFatal } from '../errors';
import { checkCocoaPods, checkIOSProject } from '../ios/common';
import { updateIOS } from '../ios/update';
import { logger } from '../log';
import { allSerial } from '../util/promise';

export async function updateCommand(
  config: Config,
  selectedPlatformName: string,
  deployment: boolean,
): Promise<void> {
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(config, platformDir, 'capacitor:update');
    } else {
      logger.error(`Platform ${c.input(selectedPlatformName)} not found.`);
    }
  } else {
    const then = +new Date();
    const platforms = await selectPlatforms(config, selectedPlatformName);
    if (platforms.length === 0) {
      logger.info(
        `There are no platforms to update yet.\n` +
          `Add platforms with ${c.input('npx cap add')}.`,
      );
      return;
    }
    try {
      await check([() => checkPackage(), ...updateChecks(config, platforms)]);

      await allSerial(
        platforms.map(platformName => async () =>
          await update(config, platformName, deployment),
        ),
      );
      const now = +new Date();
      const diff = (now - then) / 1000;
      logger.info(`Update finished in ${diff}s`);
    } catch (e) {
      if (!isFatal(e)) {
        fatal(e.stack ?? e);
      }

      throw e;
    }
  }
}

export function updateChecks(
  config: Config,
  platforms: string[],
): CheckFunction[] {
  const checks: CheckFunction[] = [];
  for (const platformName of platforms) {
    if (platformName === config.ios.name) {
      checks.push(
        () => checkCocoaPods(config),
        () => checkIOSProject(config),
      );
    } else if (platformName === config.android.name) {
      continue;
    } else if (platformName === config.web.name) {
      continue;
    } else {
      throw `Platform ${platformName} is not valid.`;
    }
  }
  return checks;
}

export async function update(
  config: Config,
  platformName: string,
  deployment: boolean,
): Promise<void> {
  await runTask(c.success(c.strong(`update ${platformName}`)), async () => {
    if (platformName === config.ios.name) {
      await updateIOS(config, deployment);
    } else if (platformName === config.android.name) {
      await updateAndroid(config);
    }
  });
}
