import { Config } from '../config';
import { updateAndroid } from '../android/update';
import { updateIOS, updateIOSChecks } from '../ios/update';
import { allSerial } from '../util/promise';
import { CheckFunction, check, checkPackage, log, logError, logFatal, logInfo, runTask } from '../common';
import { Plugin, getPlugins } from '../plugin';

import chalk from 'chalk';

export async function updateCommand(config: Config, selectedPlatformName: string, deployment: boolean) {
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

    const allPlugins = await getPlugins(config);
    await allSerial(platforms.map(platformName => async () => await update(config, allPlugins, platformName, deployment)));
    const now = +new Date;
    const diff = (now - then) / 1000;
    log(`Update finished in ${diff}s`);
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

export async function update(config: Config, plugins: Plugin[], platformName: string, deployment: boolean) {
  try {
    await runTask(chalk`{green {bold update}} {bold ${platformName}}`, async () => {
      if (platformName === config.ios.name) {
        await updateIOS(config, plugins, deployment);
      } else if (platformName === config.android.name) {
        await updateAndroid(config, plugins);
      }
    });
  } catch (e) {
    logError('Error running update:', e);
  }
}
