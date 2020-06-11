import { Config } from '../config';
import { copy } from './copy';
import { update, updateChecks } from './update';
import { check, checkPackage, checkWebDir, hasYarn, log, logError, logFatal, logInfo, resolveNode, runCommand } from '../common';

import { allSerial } from '../util/promise';

/**
 * Sync is a copy and an update in one.
 */
export async function syncCommand(config: Config, selectedPlatformName: string, deployment: boolean) {
  if (selectedPlatformName && !config.isValidPlatform(selectedPlatformName)) {
    const platformFolder = resolveNode(config, selectedPlatformName);
    if (platformFolder) {
      const result = await runCommand(`cd "${platformFolder}" && ${await hasYarn(config) ? 'yarn' : 'npm'} run sync`);
      log('result', result);
    } else {
      logError(`platform ${selectedPlatformName} not found`);
    }
  } else {
    const then = +new Date;
    const platforms = config.selectPlatforms(selectedPlatformName);
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
}

export async function sync(config: Config, platformName: string, deployment: boolean) {
  try {
    await copy(config, platformName);
  } catch (e) {
    logError(e);
  }
  await update(config, platformName, deployment);
}
