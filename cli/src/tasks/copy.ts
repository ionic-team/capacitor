import { copy as fsCopy, pathExists, remove, writeJSON } from '@ionic/utils-fs';
import { basename, join, relative, resolve } from 'path';

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
import type { Portal } from '../declarations';
import type { Config } from '../definitions';
import { isFatal } from '../errors';
import { logger } from '../log';
import { getPlugins } from '../plugin';
import { allSerial } from '../util/promise';
import { copyWeb } from '../web/copy';

export async function copyCommand(
  config: Config,
  selectedPlatformName: string,
): Promise<void> {
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(
        config,
        selectedPlatformName,
        platformDir,
        'capacitor:copy',
      );
    } else {
      logger.error(`Platform ${c.input(selectedPlatformName)} not found.`);
    }
  } else {
    const platforms = await selectPlatforms(config, selectedPlatformName);
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

    await runPlatformHook(
      config,
      platformName,
      config.app.rootDir,
      'capacitor:copy:before',
    );

    const allPlugins = await getPlugins(config, platformName);
    let usesCapacitorPortals = false;
    if (
      allPlugins.filter(
        plugin => plugin.id === '@ionic-enterprise/capacitor-portals',
      ).length > 0
    ) {
      usesCapacitorPortals = true;
    }

    if (platformName === config.ios.name) {
      if (usesCapacitorPortals) {
        await copyFederatedWebDirs(config, await config.ios.webDirAbs);
      } else {
        await copyWebDir(
          config,
          await config.ios.webDirAbs,
          config.app.webDirAbs,
        );
      }
      await copyCapacitorConfig(config, config.ios.nativeTargetDirAbs);
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      await handleCordovaPluginsJS(cordovaPlugins, config, platformName);
    } else if (platformName === config.android.name) {
      if (usesCapacitorPortals) {
        await copyFederatedWebDirs(config, config.android.webDirAbs);
      } else {
        await copyWebDir(
          config,
          config.android.webDirAbs,
          config.app.webDirAbs,
        );
      }
      await copyCapacitorConfig(config, config.android.assetsDirAbs);
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      await handleCordovaPluginsJS(cordovaPlugins, config, platformName);
      await writeCordovaAndroidManifest(cordovaPlugins, config, platformName);
    } else if (platformName === config.web.name) {
      if (usesCapacitorPortals) {
        logger.info(
          'Capacitor Portals Plugin installed, skipping web bundling...',
        );
      } else {
        await copyWeb(config);
      }
    } else {
      throw `Platform ${platformName} is not valid.`;
    }
  });

  await runPlatformHook(
    config,
    platformName,
    config.app.rootDir,
    'capacitor:copy:after',
  );
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

async function copyWebDir(
  config: Config,
  nativeAbsDir: string,
  webAbsDir: string,
) {
  const webRelDir = basename(webAbsDir);
  const nativeRelDir = relative(config.app.rootDir, nativeAbsDir);

  if (config.app.extConfig.server?.url && !(await pathExists(webAbsDir))) {
    logger.warn(
      `Cannot copy web assets from ${c.strong(
        webRelDir,
      )} to ${nativeRelDir}\n` +
        `Web asset directory specified by ${c.input(
          'webDir',
        )} does not exist. This is not an error because ${c.input(
          'server.url',
        )} is set in config.`,
    );

    return;
  }

  await runTask(
    `Copying web assets from ${c.strong(webRelDir)} to ${nativeRelDir}`,
    async () => {
      await remove(nativeAbsDir);
      return fsCopy(webAbsDir, nativeAbsDir);
    },
  );
}

async function copyFederatedWebDirs(config: Config, nativeAbsDir: string) {
  logger.info('Capacitor Portals Plugin Loaded - Copying Web Assets');

  if (!config.app.extConfig?.plugins?.Portals) {
    throw `Capacitor Portals plugin is present but no valid config is defined.`;
  }

  const portalsConfig = config.app.extConfig.plugins.Portals;
  if (!isPortal(portalsConfig.shell)) {
    throw `Capacitor Portals plugin is present but no valid Shell application is defined in the config.`;
  }

  if (!portalsConfig.apps.every(isPortal)) {
    throw `Capacitor Portals plugin is present but there is a problem with the apps defined in the config.`;
  }

  await Promise.all(
    [...portalsConfig.apps, portalsConfig.shell].map(app => {
      const appDir = resolve(config.app.rootDir, app.webDir);
      return copyWebDir(config, resolve(nativeAbsDir, app.name), appDir);
    }),
  );
}

function isPortal(config: any): config is Portal {
  return (
    (config as Portal).webDir !== undefined &&
    (config as Portal).name !== undefined
  );
}
