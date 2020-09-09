import c from '../colors';
import { Config } from '../config';
import { updateAndroid } from '../android/update';
import { updateIOS, updateIOSChecks } from '../ios/update';
import { allSerial } from '../util/promise';
import {
  CheckFunction,
  check,
  checkPackage,
  logFatal,
  resolvePlatform,
  runPlatformHook,
  runTask,
} from '../common';
import { logger } from '../log';

export async function updateCommand(
  config: Config,
  selectedPlatformName: string,
  deployment: boolean,
) {
  if (selectedPlatformName && !config.isValidPlatform(selectedPlatformName)) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(platformDir, 'capacitor:update');
    } else {
      logger.error(`Platform ${c.input(selectedPlatformName)} not found.`);
    }
  } else {
    const then = +new Date();
    const platforms = config.selectPlatforms(selectedPlatformName);
    if (platforms.length === 0) {
      logger.info(
        `There are no platforms to update yet.\n` +
          `Add platforms with ${c.input('npx cap add')}.`,
      );
      return;
    }
    try {
      await check(config, [checkPackage, ...updateChecks(config, platforms)]);

      await allSerial(
        platforms.map(platformName => async () =>
          await update(config, platformName, deployment),
        ),
      );
      const now = +new Date();
      const diff = (now - then) / 1000;
      logger.info(`Update finished in ${diff}s`);
    } catch (e) {
      logFatal(e.stack ?? e);
    }
  }
}

export function updateChecks(
  config: Config,
  platforms: string[],
): CheckFunction[] {
  const checks: CheckFunction[] = [];
  for (let platformName of platforms) {
    if (platformName === config.ios.name) {
      checks.push(...updateIOSChecks);
    } else if (platformName === config.android.name) {
      return [];
    } else if (platformName === config.web.name) {
      return [];
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
) {
  try {
    await runTask(c.success(c.strong(`update ${platformName}`)), async () => {
      if (platformName === config.ios.name) {
        await updateIOS(config, deployment);
      } else if (platformName === config.android.name) {
        await updateAndroid(config);
      }
    });
  } catch (e) {
    logger.error(`Error running update:\n` + e.stack ?? e);
  }
}
