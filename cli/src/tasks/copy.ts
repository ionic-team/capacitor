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
    } catch (e: any) {
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
    let usesFederatedCapacitor = false;
    if (
      allPlugins.filter(
        plugin => plugin.id === '@ionic-enterprise/federated-capacitor',
      ).length > 0
    ) {
      usesFederatedCapacitor = true;
    }

    let usesLiveUpdates = false;
    if (
      allPlugins.filter(plugin => plugin.id === '@capacitor/live-updates')
        .length > 0
    ) {
      usesLiveUpdates = true;
    }

    let usesSSLPinning = false;
    if (
      allPlugins.filter(plugin => plugin.id === '@ionic-enterprise/ssl-pinning')
        .length > 0
    ) {
      usesSSLPinning = true;
    }

    if (platformName === config.ios.name) {
      if (usesFederatedCapacitor) {
        await copyFederatedWebDirs(config, await config.ios.webDirAbs);
        if (config.app.extConfig?.plugins?.FederatedCapacitor?.liveUpdatesKey) {
          await copySecureLiveUpdatesKey(
            config.app.extConfig.plugins.FederatedCapacitor.liveUpdatesKey,
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
      if (usesSSLPinning && config.app.extConfig?.plugins?.SSLPinning?.certs) {
        await copySSLCert(
          config.app.extConfig.plugins.SSLPinning?.certs as unknown as string[],
          config.app.rootDir,
          await config.ios.webDirAbs,
        );
      }
      await copyCapacitorConfig(config, config.ios.nativeTargetDirAbs);
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      await handleCordovaPluginsJS(cordovaPlugins, config, platformName);
    } else if (platformName === config.android.name) {
      if (usesFederatedCapacitor) {
        await copyFederatedWebDirs(config, config.android.webDirAbs);
        if (config.app.extConfig?.plugins?.FederatedCapacitor?.liveUpdatesKey) {
          await copySecureLiveUpdatesKey(
            config.app.extConfig.plugins.FederatedCapacitor.liveUpdatesKey,
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
      if (usesSSLPinning && config.app.extConfig?.plugins?.SSLPinning?.certs) {
        await copySSLCert(
          config.app.extConfig.plugins.SSLPinning?.certs as unknown as string[],
          config.app.rootDir,
          config.android.assetsDirAbs,
        );
      }
      await copyCapacitorConfig(config, config.android.assetsDirAbs);
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      await handleCordovaPluginsJS(cordovaPlugins, config, platformName);
      await writeCordovaAndroidManifest(cordovaPlugins, config, platformName);
    } else if (platformName === config.web.name) {
      if (usesFederatedCapacitor) {
        logger.info(
          'FederatedCapacitor Plugin installed, skipping web bundling...',
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
  logger.info('FederatedCapacitor Plugin Loaded - Copying Web Assets');

  if (!config.app.extConfig?.plugins?.FederatedCapacitor) {
    throw `FederatedCapacitor plugin is present but no valid config is defined.`;
  }

  const federatedConfig = config.app.extConfig.plugins.FederatedCapacitor;
  if (federatedConfig) {
    if (federatedConfig.shell.name === undefined) {
      throw `FederatedCapacitor plugin is present but no valid Shell application is defined in the config.`;
    }

    if (!federatedConfig.apps.every(isFederatedApp)) {
      throw `FederatedCapacitor plugin is present but there is a problem with the apps defined in the config.`;
    }

    const copyApps = (): Promise<void>[] => {
      return federatedConfig.apps.map(app => {
        const appDir = resolve(config.app.rootDir, app.webDir);
        return copyWebDir(config, resolve(nativeAbsDir, app.name), appDir);
      });
    };

    const copyShell = (): Promise<void> => {
      return copyWebDir(
        config,
        resolve(nativeAbsDir, federatedConfig.shell.name),
        config.app.webDirAbs,
      );
    };

    await Promise.all([...copyApps(), copyShell()]);
  }
}

function isFederatedApp(config: any): config is FederatedApp {
  return (
    (config as FederatedApp).webDir !== undefined &&
    (config as FederatedApp).name !== undefined
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

async function copySSLCert(
  sslCertPaths: string[],
  rootDir: string,
  targetDir: string,
) {
  const validCertPaths: string[] = [];
  for (const sslCertPath of sslCertPaths) {
    const certAbsFromPath = join(rootDir, sslCertPath);
    if (!(await pathExists(certAbsFromPath))) {
      logger.warn(
        `Cannot copy SSL Certificate file from ${c.strong(certAbsFromPath)}\n` +
          `SSL Certificate does not exist at specified path.`,
      );

      return;
    }
    validCertPaths.push(certAbsFromPath);
  }
  const certsDirAbsToPath = join(targetDir, 'certs');
  const certsDirRelToDir = relative(rootDir, targetDir);
  await runTask(
    `Copying SSL Certificates from to ${certsDirRelToDir}`,
    async () => {
      const promises: Promise<void>[] = [];
      for (const certPath of validCertPaths) {
        promises.push(
          fsCopy(certPath, join(certsDirAbsToPath, basename(certPath))),
        );
      }
      return Promise.all(promises);
    },
  );
}

interface LiveUpdateConfig {
  key?: string;
}

interface FederatedApp {
  name: string;
  webDir: string;
}

interface FederatedCapacitor {
  shell: Omit<FederatedApp, 'webDir'>;
  apps: FederatedApp[];
  liveUpdatesKey?: string;
}

declare module '../declarations' {
  interface PluginsConfig {
    LiveUpdates?: LiveUpdateConfig;
    FederatedCapacitor?: FederatedCapacitor;
  }
}
