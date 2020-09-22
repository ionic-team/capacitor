import { Config } from '../config';
import { updateAndroid } from '../android/update';
import { updateIOS, updateIOSChecks } from '../ios/update';
import { allSerial } from '../util/promise';
import { CheckFunction, check, checkPackage, electronWarning, hasYarn, log, logError, logFatal, logInfo, resolvePlatform, runCommand, runPlatformHook, runTask } from '../common';

import chalk from 'chalk';

export async function updateCommand(config: Config, selectedPlatformName: string, deployment: boolean) {
  if (selectedPlatformName && !config.isValidPlatform(selectedPlatformName)) {
    const platformFolder = resolvePlatform(config, selectedPlatformName);
    if (platformFolder) {
      const result = await runPlatformHook(`cd "${platformFolder}" && ${await hasYarn(config) ? 'yarn' : 'npm'} run capacitor:update`);
      log(result);
    } else {
      logError(`platform ${selectedPlatformName} not found`);
    }
  } else {
    const then = +new Date;
    const platforms = config.selectPlatforms(selectedPlatformName);
    if (platforms.length === 0) {
      logInfo(`There are no platforms to update yet. Create one with "capacitor create".`);
      return;
    }
    try {
      await check(
        config,
        [checkPackage, ...updateChecks(config, platforms)]
      );

      await allSerial(platforms.map(platformName => async () => await update(config, platformName, deployment)));
      const now = +new Date;
      const diff = (now - then) / 1000;
      log(`Update finished in ${diff}s`);
    } catch (e) {
      logFatal(e);
    }
  }
}

export function updateChecks(config: Config, platforms: string[]): CheckFunction[] {
  const checks: CheckFunction[] = [];
  for (let platformName of platforms) {
    if (platformName === config.ios.name) {
      checks.push(...updateIOSChecks);
    } else if (platformName === config.android.name) {
      return [];
    } else if (platformName === config.web.name) {
      return [];
    } else if (platformName === config.electron.name) {
      electronWarning();
      return [];
    } else {
      throw `Platform ${platformName} is not valid.`;
    }
  }
  return checks;
}

export async function update(config: Config, platformName: string, deployment: boolean) {
  await runTask(chalk`{green {bold update}} {bold ${platformName}}`, async () => {
    if (platformName === config.ios.name) {
      await updateIOS(config, deployment);
    } else if (platformName === config.android.name) {
      await updateAndroid(config);
    }
  });
}
