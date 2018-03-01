import { Config } from '../config';
import { check, checkWebDir, logFatal, logInfo, runTask } from '../common';
import { existsAsync, symlinkAsync } from '../util/fs';
import { allSerial } from '../util/promise';
import { copyWeb } from '../web/copy';
import { basename, join, relative, resolve } from 'path';
import { copy as fsCopy, remove } from 'fs-extra';
import { copyCordovaJSFiles } from '../cordova'
import chalk from 'chalk';

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
  await runTask(chalk`{green {bold copy}}`, async () => {
    if (!await existsAsync(config.app.webDirAbs)) {
      throw new Error('Web dir doesn\'t exist. Make sure you\'ve run npm build then run npx cap copy again');
    }

    if (platformName === config.ios.name) {
      await copyWebDir(config, config.ios.webDirAbs);
      await copyNativeBridge(config, config.ios.webDirAbs);
      await copyCordovaJSFiles(config, platformName);
    } else if (platformName === config.android.name) {
      await copyWebDir(config, config.android.webDirAbs);
      await copyNativeBridge(config, config.android.webDirAbs);
      await copyProxyPolyfill(config, config.android.webDirAbs);
      await copyCordovaJSFiles(config, platformName);
    } else if (platformName === config.web.name) {
      await copyWeb(config);
    } else {
      throw `Platform ${platformName} is not valid.`;
    }
  });
}

async function copyNativeBridge(config: Config, nativeAbsDir: string) {
  const bridgePath = resolve(config.app.rootDir, 'node_modules', '@capacitor/core', 'native-bridge.js');
  if (!await existsAsync(bridgePath)) {
    logFatal(`Unable to find node_modules/@capacitor/core/native-bridge.js. Are you sure`,
    '@capacitor/core is installed? This file is required for Capacitor to function');
    return;
  }

  await runTask('Copying native bridge', async () => {
    return fsCopy(bridgePath, join(nativeAbsDir, 'native-bridge.js'));
  });
}

async function copyProxyPolyfill(config: Config, nativeAbsDir: string) {
    const polyfillPath = resolve(config.app.rootDir, 'node_modules', '@capacitor/core', 'proxy-polyfill.js');
    if (!await existsAsync(polyfillPath)) {
        logFatal(`Unable to find node_modules/@capacitor/core/proxy-polyfill.js. Are you sure`,
            '@capacitor/core is installed?');
        return;
    }

    await runTask('Copying Proxy-Polyfill', async () => {
        return fsCopy(polyfillPath, join(nativeAbsDir, 'proxy-polyfill.js'));
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
