import { exec } from 'child_process';
import { Config } from '../config';
import { logInfo } from '../common';
import { existsAsync } from '../util/fs';
import { resolve } from 'path';

export async function openElectron(config: Config) {

  const dir = config.electron.platformDir;

  logInfo(`Opening Electron project at ${dir}`);

  if (!await existsAsync(resolve(config.app.rootDir, dir))) {
    throw new Error('Electron project does not exist. Create one with "npx cap add electron"');
  }

  return new Promise(async (resolve, reject) => {
    exec(`npm run electron:start`, {cwd: dir}, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

}
