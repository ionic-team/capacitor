import { Config } from '../config';
import { copy } from './copy';
import { update, updateChecks } from './update';
import { check, checkPackage, checkWebDir, logFatal, logInfo } from '../common';

import { allSerial } from '../util/promise';


export async function syncCommand(config: Config, selectedPlatform: string) {
  const platforms = config.selectPlatforms(selectedPlatform);
  if (platforms.length === 0) {
    logInfo(`There are no platforms to sync yet. Create one with "capacitor create".`);
    return;
  }
  try {
    await check(config, [checkPackage, checkWebDir, ...updateChecks(config, platforms)]);
    await allSerial(platforms.map(platformName => () => sync(config, platformName)));
  } catch (e)  {
    logFatal(e);
  }
}

export async function sync(config: Config, platformName: string) {
  const tasks = [() => copy(config, platformName), () => update(config, platformName, false)];
  await allSerial(tasks);
}
