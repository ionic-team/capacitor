import { check, checkNPMVersion, checkWebDir, logFatal, logSuccess, resolveNodeFrom } from '../common';
import { Config } from '../config';
import { existsAsync } from '../util/fs';
import { join } from 'path';

export async function doctorElectron(config: Config) {
  try {
    await check(
      config,
      [
        checkWebDir,
        checkNPMVersion,
        checkAppSrcDirs,
        checkElectronInstall
      ]
    );
    logSuccess('electron looking great! 👌');
  } catch (e) {
    logFatal(e);
  }

}

async function checkAppSrcDirs(config: Config) {
  const appDir = join(config.electron.platformDir, 'app');
  if (!await existsAsync(appDir)) {
    return `"app" directory is missing in: ${config.electron.platformDir}`;
  }

  const appIndexHtml = join(appDir, 'index.html');
  if (!await existsAsync(appIndexHtml)) {
    return `"index.html" directory is missing in: ${appDir}`;
  }
  return checkElectronIndexFile(config, config.electron.platformDir);
}

async function checkElectronIndexFile(config: Config, electronDir: string) {
  const indexFileName = 'index.js';
  const indexFilePath = join(electronDir, indexFileName);

  if (!await existsAsync(indexFilePath)) {
    return `"${indexFilePath}" is missing in: ${electronDir}`;
  }
  return null;
}

async function checkElectronInstall(config: Config) {
  if (resolveNodeFrom(config.electron.platformDir, 'electron')) {
    return null;
  } else {
    return 'electron not installed';
  }
}
