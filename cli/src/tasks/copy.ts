import { Config } from '../config';
import { checkWebDir, electronWarning, hasYarn, log, logError, logFatal, logInfo, resolveNode, resolvePlatform, runPlatformHook, runTask } from '../common';
import { existsAsync } from '../util/fs';
import { allSerial } from '../util/promise';
import { copyWeb } from '../web/copy';
import { copyElectron } from '../electron/copy';
import { basename, join, relative, resolve } from 'path';
import { copy as fsCopy, remove } from 'fs-extra';
import { getCordovaPlugins, handleCordovaPluginsJS, writeCordovaAndroidManifest } from '../cordova';
import chalk from 'chalk';

export async function copyCommand(config: Config, selectedPlatformName: string) {
  if (selectedPlatformName && !config.isValidPlatform(selectedPlatformName)) {
    const platformFolder = resolvePlatform(config, selectedPlatformName);
    if (platformFolder) {
      const result = await runPlatformHook(`cd "${platformFolder}" && ${await hasYarn(config) ? 'yarn' : 'npm'} run capacitor:copy`);
      log(result);
    } else {
      logError(`platform ${selectedPlatformName} not found`);
    }
  } else {
    const platforms = config.selectPlatforms(selectedPlatformName);
    if (platforms.length === 0) {
      logInfo(`There are no platforms to copy yet. Create one with \`capacitor create\`.`);
      return;
    }
    try {
      await allSerial(platforms.map(platformName => () => copy(config, platformName)));
    } catch (e) {
      logError(e);
    }
  }
}

export async function copy(config: Config, platformName: string) {
  await runTask(chalk`{green {bold copy}}`, async () => {

    const result = await checkWebDir(config);
    if (result) {
      throw result;
    }

    if (platformName === config.ios.name) {
      await copyWebDir(config, config.ios.webDirAbs);
      await copyNativeBridge(config, config.ios.webDirAbs);
      await copyCapacitorConfig(config, join(config.ios.platformDir, config.ios.nativeProjectName, config.ios.nativeProjectName));
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      await handleCordovaPluginsJS(cordovaPlugins, config, platformName);
    } else if (platformName === config.android.name) {
      await copyWebDir(config, config.android.webDirAbs);
      await copyNativeBridge(config, config.android.webDirAbs);
      await copyCapacitorConfig(config, join(config.android.platformDir, 'app/src/main/assets'));
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      await handleCordovaPluginsJS(cordovaPlugins, config, platformName);
      await writeCordovaAndroidManifest(cordovaPlugins, config, platformName);
    } else if (platformName === config.web.name) {
      await copyWeb(config);
    } else if (platformName === config.electron.name) {
      await copyElectron(config);
      await copyCapacitorConfig(config, config.electron.platformDir);
      electronWarning();
    } else {
      throw `Platform ${platformName} is not valid.`;
    }
  });
}

async function copyNativeBridge(config: Config, nativeAbsDir: string) {
  let bridgePath = resolveNode(config, '@capacitor/core', 'native-bridge.js');
  if (!bridgePath) {
    logFatal(`Unable to find node_modules/@capacitor/core/native-bridge.js. Are you sure`,
    '@capacitor/core is installed? This file is required for Capacitor to function');
    return;
  }

  await runTask('Copying native bridge', async () => {
    return fsCopy(bridgePath!, join(nativeAbsDir, 'native-bridge.js'));
  });
}

async function copyCapacitorConfig(config: Config, nativeAbsDir: string) {
  const configPath = resolve(config.app.extConfigFilePath);
  if (!await existsAsync(configPath)) {
    return;
  }

  await runTask('Copying capacitor.config.json', async () => {
    return fsCopy(configPath, join(nativeAbsDir, 'capacitor.config.json'));
  });
}

async function copyWebDir(config: Config, nativeAbsDir: string) {
  var chalk = require('chalk');
  const webAbsDir = config.app.webDirAbs;
  const webRelDir = basename(webAbsDir);
  const nativeRelDir = relative(config.app.rootDir, nativeAbsDir);

  await runTask(`Copying web assets from ${chalk.bold(webRelDir)} to ${chalk.bold(nativeRelDir)}`, async () => {
    await remove(nativeAbsDir);
    return fsCopy(webAbsDir, nativeAbsDir);
  });
}
