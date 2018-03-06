import { Config } from '../config';
import { updateAndroid } from '../android/update';
import { updateIOS, updateIOSChecks } from '../ios/update';
import { allSerial } from '../util/promise';
import { CheckFunction, check, checkPackage, log, logFatal, logInfo, runTask, writeXML } from '../common';
import { emoji as _e } from '../util/emoji';

import chalk from 'chalk';

export async function updateCommand(config: Config, selectedPlatformName: string) {
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

    await allSerial(platforms.map(platformName => async () => await update(config, platformName, true)));
    const then = +new Date;
  } catch (e) {
    logFatal(e);
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
      return [];
    } else {
      throw `Platform ${platformName} is not valid.`;
    }
  }
  return checks;
}

export async function update(config: Config, platformName: string, needsUpdate: boolean) {
  runTask(chalk`{green {bold update}} {bold ${platformName}}`, async () => {
    if (platformName === config.ios.name) {
      await updateIOS(config, needsUpdate);
    } else if (platformName === config.android.name) {
      await updateAndroid(config, needsUpdate);
    }
  });
}
