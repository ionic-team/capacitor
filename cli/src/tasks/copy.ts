import { Config } from '../config';
import { add, checkWebDir, logFatal, logInfo, runTask } from '../common';
import { symlinkAsync, existsAsync } from '../util/fs';
import { join, resolve, relative } from 'path';
import { copy as fsCopy, remove } from 'fs-extra';


export async function copyCommand(config: Config, selectedPlatformName: string) {
  const platforms = config.selectPlatforms(selectedPlatformName);
  if (platforms.length === 0) {
    logInfo(`There are no platforms to copy yet. Create one with "capacitor create".`);
    return;
  }
  try {
    await add(config, [checkWebDir]);
    await Promise.all(platforms.map(platformName => {
      return copy(config, platformName);
    }));
  } catch (e) {
    logFatal(e);
  }
}

export async function copy(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await copyWebDir(config, config.ios.webDir);
    await copyNativeBridge(config, config.ios.webDir);
  } else if (platformName === config.android.name) {
    await copyWebDir(config, config.android.webDir);
    await copyNativeBridge(config, config.android.webDir);
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

async function copyNativeBridge(config: Config, nativeAbsDir: string) {
  const bridgePath = resolve('node_modules', '@capacitor/core', 'native-bridge.js');
  if (!existsAsync(bridgePath)) {
    logFatal(`Unable to find node_modules/@capacitor/core/native-bridge.js. Are you sure`,
    '@capacitor/core is installed? This file is required for Capacitor to function');
    return;
  }

  return await fsCopy(bridgePath, join(nativeAbsDir, 'native-bridge.js'));
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
      return await fsCopy(webAbsDir, nativeAbsDir);
    });
  }
}
