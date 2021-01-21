import { copy as fsCopy, remove, writeJSON } from '@ionic/utils-fs';
import { basename, join, relative } from 'path';

import c from '../colors';
import {
  checkWebDir,
  resolvePlatform,
  runPlatformHook,
  runTask,
  isValidPlatform,
  selectPlatforms,
} from '../common';
import {
  getCordovaPlugins,
  handleCordovaPluginsJS,
  writeCordovaAndroidManifest,
} from '../cordova';
import type { Config } from '../definitions';
import { isFatal } from '../errors';
import { logger } from '../log';
import { allSerial } from '../util/promise';
import { copyWeb } from '../web/copy';

export async function copyCommand(
  config: Config,
  selectedPlatformName: string,
): Promise<void> {
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(config, platformDir, 'capacitor:copy');
    } else {
      logger.error(`Platform ${c.input(selectedPlatformName)} not found.`);
    }
  } else {
    const platforms = await selectPlatforms(config, selectedPlatformName);
    if (platforms.length === 0) {
      logger.info(
        `There are no platforms to copy yet.\n` +
          `Add platforms with ${c.input('npx cap add')}.`,
      );
      return;
    }
    try {
      await allSerial(
        platforms.map(platformName => () => copy(config, platformName)),
      );
    } catch (e) {
      if (isFatal(e)) {
        throw e;
      }

      logger.error(e.stack ?? e);
    }
  }
}

export async function copy(
  config: Config,
  platformName: string,
): Promise<void> {
  await runTask(c.success(c.strong(`copy ${platformName}`)), async () => {
    const result = await checkWebDir(config);
    if (result) {
      throw result;
    }

    if (platformName === config.ios.name) {
      await copyWebDir(config, await config.ios.webDirAbs);
      await copyCapacitorConfig(config, config.ios.nativeTargetDirAbs);
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      await handleCordovaPluginsJS(cordovaPlugins, config, platformName);
    } else if (platformName === config.android.name) {
      await copyWebDir(config, config.android.webDirAbs);
      await copyCapacitorConfig(config, config.android.assetsDirAbs);
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      await handleCordovaPluginsJS(cordovaPlugins, config, platformName);
      await writeCordovaAndroidManifest(cordovaPlugins, config, platformName);
    } else if (platformName === config.web.name) {
      await copyWeb(config);
    } else {
      throw `Platform ${platformName} is not valid.`;
    }
  });
}

async function copyCapacitorConfig(config: Config, nativeAbsDir: string) {
  const nativeRelDir = relative(config.app.rootDir, nativeAbsDir);
  const nativeConfigFile = 'capacitor.config.json';
  const nativeConfigFilePath = join(nativeAbsDir, nativeConfigFile);

  await runTask(
    `Creating ${c.strong(nativeConfigFile)} in ${nativeRelDir}`,
    async () => {
      await writeJSON(nativeConfigFilePath, config.app.extConfig, {
        spaces: '\t',
      });
    },
  );
}

async function copyWebDir(config: Config, nativeAbsDir: string) {
  const webAbsDir = config.app.webDirAbs;
  const webRelDir = basename(webAbsDir);
  const nativeRelDir = relative(config.app.rootDir, nativeAbsDir);

  await runTask(
    `Copying web assets from ${c.strong(webRelDir)} to ${nativeRelDir}`,
    async () => {
      await remove(nativeAbsDir);
      return fsCopy(webAbsDir, nativeAbsDir);
    },
  );
}
