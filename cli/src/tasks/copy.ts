import { Config } from '../config';
import { add, checkWebDir, logFatal, logInfo, runTask } from '../common';
import { symlinkAsync } from '../util/fs';
import { relative } from 'path';
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

  } else if (platformName === config.android.name) {
    await copyWebDir(config, config.android.webDir);

  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

async function copyWebDir(config: Config, nativeAbsDir: string) {
  const webAbsDir = config.app.webDir;
  const webRelDir = relative(config.app.rootDir, webAbsDir);
  const nativeRelDir = relative(config.app.rootDir, nativeAbsDir);

  if (config.app.symlinkWebDir) {
    await runTask(`Creating symlink ${nativeRelDir} -> ${webRelDir}`, async () => {
      await remove(nativeAbsDir);
      await symlinkAsync(webAbsDir, nativeAbsDir);
    });
  } else {
    await runTask(`Copying ${webRelDir} -> ${nativeRelDir}`, async () => {
      await remove(nativeAbsDir);
      await fsCopy(webAbsDir, nativeAbsDir);
    });
  }
}
