import { Config } from '../config';
import { check, checkWebDir, logFatal, logInfo, runTask } from '../common';
import { existsAsync, symlinkAsync } from '../util/fs';
import { allSerial } from '../util/promise';
import { copyWeb } from '../web/copy';
import { basename, join, relative, resolve } from 'path';
import { copy as fsCopy, remove } from 'fs-extra';
import { copyCordovaJSFiles } from '../cordova'


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
    await copyWebDir(config, config.ios.webDirAbs);
    await copyNativeBridge(config, config.ios.webDirAbs);
    await copyCordovaJSFiles(config, platformName);
  } else if (platformName === config.android.name) {
    await copyWebDir(config, config.android.webDirAbs);
    await copyNativeBridge(config, config.android.webDirAbs);
    await copyCordovaJSFiles(config, platformName);
  } else if (platformName === config.web.name) {
    await copyWeb(config);
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

async function copyNativeBridge(config: Config, nativeAbsDir: string) {
  const bridgePath = resolve(config.app.rootDir, 'node_modules', '@capacitor/core', 'native-bridge.js');
  if (!await existsAsync(bridgePath)) {
    logFatal(`Unable to find node_modules/@capacitor/core/native-bridge.js. Are you sure`,
    '@capacitor/core is installed? This file is required for Capacitor to function');
    return;
  }

  console.log('Copying native bridge', bridgePath, nativeAbsDir);

  return fsCopy(bridgePath, join(nativeAbsDir, 'native-bridge.js'));
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
