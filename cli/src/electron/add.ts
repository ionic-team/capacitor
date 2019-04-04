import { exec } from 'child_process';
import { Config } from '../config';
import { copyTemplate, hasYarn, runTask } from '../common';

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
    console.log('Installing NPM Dependencies...');
    exec(`${await hasYarn(config) ? 'yarn' : 'npm'} install`, {cwd: pathToElectronPackageJson}, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      console.log(`${stdout}`);
      console.log(`${stderr}`);
      console.log(`NPM Dependencies installed!`);
      resolve();
    });
  });
}
