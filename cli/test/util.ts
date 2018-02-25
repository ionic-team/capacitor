import { exec } from 'child_process';
import { join, resolve } from 'path';
import { existsAsync, mkdirAsync, readFileAsync, writeFileAsync, cpAsync } from '../src/util/fs';
import { mkdirs } from 'fs-extra';
const tmp = require('tmp');

const cwd = process.cwd();

export async function run(appRoot: string, capCommand: string) {
  return new Promise((resolve, reject) => {
    exec(`cd ${appRoot} && ${cwd}/bin/cap ${capCommand}`, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export function mktmp() {
  return new Promise((resolve, reject) => {
    tmp.dir((err, path, cleanupCallback) => {
      if (err) {
        throw err;
      }

      resolve({
        cleanupCallback,
        path
      });
    });
  });
}

export async function makeAppDir() {
  const appDirObj: any = await mktmp();
  const tmpDir = appDirObj.path;
  const appDir = join(tmpDir, 'test-app');
  await mkdirAsync(appDir);
  // Make the web dir
  await mkdirAsync(join(appDir, 'www'));
  // Make a fake package.json
  await writeFileAsync(join(appDir, 'package.json'), "{}");
  await mkdirAsync(join(appDir, 'node_modules'));
  const cliModulesPath = join(appDir, 'node_modules/@capacitor/cli');
  const coreModulesPath = join(appDir, 'node_modules/@capacitor/core');
  await mkdirs(cliModulesPath);
  await mkdirs(coreModulesPath);
  await cpAsync(join(cwd, 'dist'), cliModulesPath);
  await cpAsync(resolve(cwd, '../core/dist'), coreModulesPath);
  await cpAsync(resolve(cwd, '../core/native-bridge.js'), join(coreModulesPath, 'native-bridge.js'));

  return {
    ...appDirObj,
     appDir
  };
}

class MappedFS {
  constructor(private rootDir) {
  }
  async read (path) {
    return readFileAsync(resolve(this.rootDir, path), 'utf8');
  }
  async exists(path) {
    return existsAsync(resolve(this.rootDir, path));
  }
}

export { MappedFS };