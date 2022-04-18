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
import type { Federation } from '../declarations';
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
    let isFederated = false;
    if (
      allPlugins.filter(plugin => plugin.id === '@capacitor/federation')
        .length > 0
    ) {
      isFederated = true;
    }

    if (platformName === config.ios.name) {
      if (isFederated) {
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
      if (isFederated) {
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
      if (isFederated) {
        logger.info(
          'Federated Capacitor Plugin installed, skipping web bundling...',
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
  logger.info('Federated Capacitor Plugin Loaded - Copying Web Assets');

  if (!config.app.extConfig?.plugins?.Federation) {
    throw `Federated Capacitor plugin is present but no valid config is defined.`;
  }

  const fedConfig = config.app.extConfig.plugins.Federation;
  if (!isFederation(fedConfig.shell)) {
    throw `Federated Capacitor plugin is present but no valid Shell application is defined in the config.`;
  }

  if (!fedConfig.apps.every(isFederation)) {
    throw `Federated Capacitor plugin is present but there is a problem with the apps defined in the config.`;
  }

  await Promise.all(
    [...fedConfig.apps, fedConfig.shell].map(app => {
      const appDir = resolve(config.app.rootDir, app.webDir);
      return copyWebDir(config, resolve(nativeAbsDir, app.name), appDir);
    }),
  );
}

function isFederation(config: any): config is Federation {
  return (
    (config as Federation).webDir !== undefined &&
    (config as Federation).name !== undefined
  );
}
