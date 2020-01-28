import { exec } from 'child_process';
import { Config } from '../config';
import { copyTemplate, hasYarn, installDeps, runTask } from '../common';

export async function addElectron(config: Config) {

  await runTask(`Adding Electron project in: ${config.electron.platformDir}`, async () => {
    return copyTemplate(config.electron.assets.templateDir, config.electron.platformDir);
  });

  await runTask(`Installing NPM Dependencies`, async () => {
    return installNpmDeps(config);
  });
}

function installNpmDeps(config: Config) {
  const pathToElectronPackageJson = config.electron.platformDir;
  return new Promise(async (resolve, reject) => {
    exec(`${await hasYarn(config) ? 'yarn' : 'npm'} install`, {cwd: pathToElectronPackageJson}, async (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      await installDeps(pathToElectronPackageJson, ['@capacitor/electron'], config);
      resolve();
    });
  });
}
