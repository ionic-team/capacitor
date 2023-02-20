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

import { inlineSourceMaps } from './sourcemaps';

export async function copyCommand(
  config: Config,
  selectedPlatformName: string,
  inline = false,
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
        platforms.map(platformName => () => copy(config, platformName, inline)),
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
  inline = false,
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

    let usesLiveUpdates = false;
    if (
      allPlugins.filter(plugin => plugin.id === '@capacitor/live-updates')
        .length > 0
    ) {
      usesLiveUpdates = true;
    }

    if (platformName === config.ios.name) {
      if (usesCapacitorPortals) {
        await copyFederatedWebDirs(config, await config.ios.webDirAbs);
        if (config.app.extConfig?.plugins?.Portals?.liveUpdatesKey) {
          await copySecureLiveUpdatesKey(
            config.app.extConfig.plugins.Portals.liveUpdatesKey,
            config.app.rootDir,
            config.ios.nativeTargetDirAbs,
          );
        }
      } else {
        await copyWebDir(
          config,
          await config.ios.webDirAbs,
          config.app.webDirAbs,
        );
      }
      if (usesLiveUpdates && config.app.extConfig?.plugins?.LiveUpdates?.key) {
        await copySecureLiveUpdatesKey(
          config.app.extConfig.plugins.LiveUpdates.key,
          config.app.rootDir,
          config.ios.nativeTargetDirAbs,
        );
      }
      await copyCapacitorConfig(config, config.ios.nativeTargetDirAbs);
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      await handleCordovaPluginsJS(cordovaPlugins, config, platformName);
    } else if (platformName === config.android.name) {
      if (usesCapacitorPortals) {
        await copyFederatedWebDirs(config, config.android.webDirAbs);
        if (config.app.extConfig?.plugins?.Portals?.liveUpdatesKey) {
          await copySecureLiveUpdatesKey(
            config.app.extConfig.plugins.Portals.liveUpdatesKey,
            config.app.rootDir,
            config.android.assetsDirAbs,
          );
        }
      } else {
        await copyWebDir(
          config,
          config.android.webDirAbs,
          config.app.webDirAbs,
        );
      }
      if (usesLiveUpdates && config.app.extConfig?.plugins?.LiveUpdates?.key) {
        await copySecureLiveUpdatesKey(
          config.app.extConfig.plugins.LiveUpdates.key,
          config.app.rootDir,
          config.android.assetsDirAbs,
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
    if (inline) {
      await inlineSourceMaps(config, platformName);
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
      delete (config.app.extConfig.android as any)?.buildOptions;
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

async function copySecureLiveUpdatesKey(
  secureLiveUpdatesKeyFile: string,
  rootDir: string,
  nativeAbsDir: string,
) {
  const keyAbsFromPath = join(rootDir, secureLiveUpdatesKeyFile);
  const keyAbsToPath = join(nativeAbsDir, basename(keyAbsFromPath));
  const keyRelToDir = relative(rootDir, nativeAbsDir);

  if (!(await pathExists(keyAbsFromPath))) {
    logger.warn(
      `Cannot copy Secure Live Updates signature file from ${c.strong(
        keyAbsFromPath,
      )} to ${keyRelToDir}\n` +
        `Signature file does not exist at specified key path.`,
    );

    return;
  }

  await runTask(
    `Copying Secure Live Updates key from ${c.strong(
      secureLiveUpdatesKeyFile,
    )} to ${keyRelToDir}`,
    async () => {
      return fsCopy(keyAbsFromPath, keyAbsToPath);
    },
  );
}
