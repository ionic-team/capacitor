import { Config } from '../config';
import { copy } from './copy';
import { update, updateChecks } from './update';
import { check, checkPackage, checkWebDir, log, logError, logFatal, logInfo } from '../common';

import { allSerial } from '../util/promise';

/**
 * Sync is a copy and an update in one.
 */
export async function syncCommand(config: Config, selectedPlatform: string, deployment: boolean) {
  const then = +new Date;
  const platforms = config.selectPlatforms(selectedPlatform);
  if (platforms.length === 0) {
    logInfo(`There are no platforms to sync yet. Create one with "capacitor create".`);
    return;
  }
  try {
    await check(config, [checkPackage, checkWebDir, ...updateChecks(config, platforms)]);
    await allSerial(platforms.map(platformName => () => sync(config, platformName, deployment)));
    const now = +new Date;
    const diff = (now - then) / 1000;
    log(`Sync finished in ${diff}s`);
  } catch (e)  {
    logFatal(e);
  }
}

export async function sync(config: Config, platformName: string, deployment: boolean) {
  try {
    await copy(config, platformName);
  } catch (e) {
    logError(e);
  }
  await update(config, platformName, deployment);
}
