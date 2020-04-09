import { exec } from 'child_process';
import { Config } from '../config';
import { copyTemplate, hasYarn, installDeps, runTask } from '../common';
import * as path from 'path';
import { writeFileSync, readFileSync } from '../util/fs';

export async function addElectron(config: Config) {

  await runTask(`Adding Electron project in: ${config.electron.platformDir}`, async () => {
    const copyReturn = await copyTemplate(config.electron.assets.templateDir, config.electron.platformDir);
    const capConfigName= JSON.parse(readFileSync(path.join(config.electron.platformDir, '../capacitor.config.json')) + '')['appName'];
    const packageJSONParse = JSON.parse(readFileSync(path.join(config.electron.platformDir, './package.json')) + '');
    packageJSONParse.name = capConfigName;
    writeFileSync(path.join(config.electron.platformDir, './package.json'), JSON.stringify(packageJSONParse));
    return copyReturn;
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
