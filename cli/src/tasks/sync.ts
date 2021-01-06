import c from '../colors';
import {
  check,
  checkPackage,
  checkWebDir,
  selectPlatforms,
  isValidPlatform,
} from '../common';
import type { Config } from '../definitions';
import { fatal, isFatal } from '../errors';
import { logger } from '../log';
import { allSerial } from '../util/promise';

import { copy, copyCommand } from './copy';
import { update, updateChecks, updateCommand } from './update';

/**
 * Sync is a copy and an update in one.
 */
export async function syncCommand(
  config: Config,
  selectedPlatformName: string,
  deployment: boolean,
): Promise<void> {
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    try {
      await copyCommand(config, selectedPlatformName);
    } catch (e) {
      logger.error(e.stack ?? e);
    }
    await updateCommand(config, selectedPlatformName, deployment);
  } else {
    const then = +new Date();
    const platforms = await selectPlatforms(config, selectedPlatformName);
    if (platforms.length === 0) {
      logger.info(
        `There are no platforms to sync yet.\n` +
          `Add platforms with ${c.input('npx cap add')}.`,
      );
      return;
    }
    try {
      await check([
        () => checkPackage(),
        () => checkWebDir(config),
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
      if (!isFatal(e)) {
        fatal(e.stack ?? e);
      }

      throw e;
    }
  }
}

export async function sync(
  config: Config,
  platformName: string,
  deployment: boolean,
): Promise<void> {
  try {
    await copy(config, platformName);
  } catch (e) {
    logger.error(e.stack ?? e);
  }
  await update(config, platformName, deployment);
}
