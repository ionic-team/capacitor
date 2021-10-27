import { updateAndroid } from '../android/update';
import c from '../colors';
import {
  check,
  checkPackage,
  resolvePlatform,
  runPlatformHook,
  runTask,
  selectPlatforms,
  isValidPlatform,
} from '../common';
import type { CheckFunction } from '../common';
import type { Config } from '../definitions';
import { fatal, isFatal } from '../errors';
import { checkCocoaPods } from '../ios/common';
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
      await runPlatformHook(
        config,
        selectedPlatformName,
        platformDir,
        'capacitor:update',
      );
    } else {
      logger.error(`Platform ${c.input(selectedPlatformName)} not found.`);
    }
  } else {
    const then = +new Date();
    const platforms = await selectPlatforms(config, selectedPlatformName);
    try {
      await check([() => checkPackage(), ...updateChecks(config, platforms)]);

      await allSerial(
        platforms.map(
          platformName => async () =>
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
      checks.push(() => checkCocoaPods(config));
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
    await runPlatformHook(
      config,
      platformName,
      config.app.rootDir,
      'capacitor:update:before',
    );

    if (platformName === config.ios.name) {
      await updateIOS(config, deployment);
    } else if (platformName === config.android.name) {
      await updateAndroid(config);
    }

    await runPlatformHook(
      config,
      platformName,
      config.app.rootDir,
      'capacitor:update:after',
    );
  });
}
