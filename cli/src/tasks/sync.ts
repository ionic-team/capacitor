import c from '../colors';
import { Config } from '../config';
import { copy, copyCommand } from './copy';
import { update, updateChecks, updateCommand } from './update';
import { check, checkPackage, checkWebDir, logFatal } from '../common';

import { allSerial } from '../util/promise';
import { logger } from '../log';

/**
 * Sync is a copy and an update in one.
 */
export async function syncCommand(
  config: Config,
  selectedPlatformName: string,
  deployment: boolean,
) {
  if (selectedPlatformName && !config.isValidPlatform(selectedPlatformName)) {
    try {
      await copyCommand(config, selectedPlatformName);
    } catch (e) {
      logger.error(e.stack ?? e);
    }
    await updateCommand(config, selectedPlatformName, deployment);
  } else {
    const then = +new Date();
    const platforms = config.selectPlatforms(selectedPlatformName);
    if (platforms.length === 0) {
      logger.info(
        `There are no platforms to sync yet.\n` +
          `Add platforms with ${c.input('npx cap add')}.`,
      );
      return;
    }
    try {
      await check(config, [
        checkPackage,
        checkWebDir,
        ...updateChecks(config, platforms),
      ]);
      await allSerial(
        platforms.map(platformName => () =>
          sync(config, platformName, deployment),
        ),
      );
      const now = +new Date();
      const diff = (now - then) / 1000;
      logger.info(`Sync finished in ${diff}s`);
    } catch (e) {
      logFatal(e.stack ?? e);
    }
  }
}

export async function sync(
  config: Config,
  platformName: string,
  deployment: boolean,
) {
  try {
    await copy(config, platformName);
  } catch (e) {
    logger.error(e.stack ?? e);
  }
  await update(config, platformName, deployment);
}
