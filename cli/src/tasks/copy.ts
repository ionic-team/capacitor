import { Config } from '../config';
import { check, checkWebDir, logFatal, logInfo, runTask } from '../common';
import { existsAsync, symlinkAsync } from '../util/fs';
import { allSerial } from '../util/promise';
import { copyWeb } from '../web/copy';
import { join, relative, resolve } from 'path';
import { copy as fsCopy, remove } from 'fs-extra';


export async function copyCommand(config: Config, selectedPlatformName: string) {
  const platforms = config.selectPlatforms(selectedPlatformName);
  if (platforms.length === 0) {
    logInfo(`There are no platforms to copy yet. Create one with "capacitor create".`);
    return;
  }
  try {
    await check(config, [checkWebDir]);
    await allSerial(platforms.map(platformName => () => copy(config, platformName)));
  } catch (e) {
    logFatal(e);
  }
}

export async function copy(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await copyWebDir(config, config.ios.webDir);
    await copyNativeBridge(config, config.ios.webDir);
    await copyCordovaJS(config, config.ios.webDir);
  } else if (platformName === config.android.name) {
    await copyWebDir(config, config.android.webDir);
    await copyNativeBridge(config, config.android.webDir);
    await copyCordovaJS(config, config.android.webDir);
  } else if (platformName === config.web.name) {
    await copyWeb(config);
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

async function copyNativeBridge(config: Config, nativeAbsDir: string) {
  const bridgePath = resolve('node_modules', '@capacitor/core', 'native-bridge.js');
  if (!await existsAsync(bridgePath)) {
    logFatal(`Unable to find node_modules/@capacitor/core/native-bridge.js. Are you sure`,
    '@capacitor/core is installed? This file is required for Capacitor to function');
    return;
  }

  return fsCopy(bridgePath, join(nativeAbsDir, 'native-bridge.js'));
}

async function copyCordovaJS(config: Config, nativeAbsDir: string) {
  const cordovaPath = resolve('node_modules', '@capacitor/core', 'cordova.js');
  if (!await existsAsync(cordovaPath)) {
    logFatal(`Unable to find node_modules/@capacitor/core/cordova.js. Are you sure`,
    '@capacitor/core is installed? This file is currently required for Capacitor to function.');
    return;
  }

  return fsCopy(cordovaPath, join(nativeAbsDir, 'cordova.js'));
}

async function copyWebDir(config: Config, nativeAbsDir: string) {
  var chalk = require('chalk');
  const webAbsDir = config.app.webDir;
  const webRelDir = relative(config.app.rootDir, webAbsDir);
  const nativeRelDir = relative(config.app.rootDir, nativeAbsDir);

  if (config.app.symlinkWebDir) {
    await runTask(`Creating symlink ${nativeRelDir} -> ${webRelDir}`, async () => {
      await remove(nativeAbsDir);
      await symlinkAsync(webAbsDir, nativeAbsDir);
    });
  } else {
    await runTask(`Copying web assets from ${chalk.bold(webRelDir)} to ${chalk.bold(nativeRelDir)}`, async () => {
      await remove(nativeAbsDir);
      return fsCopy(webAbsDir, nativeAbsDir);
    });
  }
}
