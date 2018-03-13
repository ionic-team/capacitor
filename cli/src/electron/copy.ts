import { runTask } from '../common';
import { Config } from '../config';
import {copy, remove} from 'fs-extra';
import {basename, join, relative, resolve} from 'path';

export async function copyElectron(config: Config) {
  const chalk = require('chalk');
  const webAbsDir = config.app.webDirAbs;
  const webRelDir = basename(webAbsDir);
  const nativeRelDir = relative(config.app.rootDir, config.electron.webDirAbs);
  //const runtimePath = resolve(config.app.rootDir, 'node_modules', '@capacitor/core', 'dist/capacitor.js');
  return await runTask(`Copying web assets from ${chalk.bold(webRelDir)} to ${chalk.bold(nativeRelDir)}`, async () => {
    console.log(`Cleaning ${config.electron.webDirAbs}...`);
    await remove(config.electron.webDirAbs);
    console.log(`Copying web assets...`);
    return copy(webAbsDir, config.electron.webDirAbs);
    //console.log(`Copying runtime...`);
    //return copy(runtimePath, join(config.electron.webDirAbs, 'capacitor.js'));
  });
}
