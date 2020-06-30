import { exec } from 'child_process';
import { Config } from '../config';
import { copyTemplate, hasYarn, installDeps, runTask } from '../common';
import { writeFileSync } from '../util/fs';
import { join } from 'path';

export async function addElectron(config: Config) {

  await runTask(`Adding Electron project in: ${config.electron.platformDir}`, async () => {
    const copyReturn = await copyTemplate(config.electron.assets.templateDir, config.electron.platformDir);
    const capConfigName = require(join(config.app.rootDir, 'capacitor.config.json')).appName;
    const packageJSONParse = require(join(config.electron.platformDir, 'package.json'));
    packageJSONParse.name = capConfigName;
    writeFileSync(join(config.electron.platformDir, 'package.json'), JSON.stringify(packageJSONParse));
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
