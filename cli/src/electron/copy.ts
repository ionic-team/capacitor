import { copyTemplate, runTask } from '../common';
import { Config } from '../config';
import { basename, join, relative, resolve } from 'path';
import { removeAsync } from '../util/fs';

export async function copyElectron(config: Config) {
  const chalk = require('chalk');
  const webAbsDir = config.app.webDirAbs;
  const webRelDir = basename(webAbsDir);
  const nativeRelDir = relative(config.app.rootDir, config.electron.webDirAbs);
  // const runtimePath = resolve(config.app.rootDir, 'node_modules', '@capacitor/core', 'dist/capacitor.js');
  return await runTask(`Copying web assets from ${chalk.bold(webRelDir)} to ${chalk.bold(nativeRelDir)}`, async () => {
    console.log(`Cleaning ${config.electron.webDirAbs}...`);
    await removeAsync(config.electron.webDirAbs);
    console.log(`Copying web assets...`);
    return copyTemplate(webAbsDir, config.electron.webDirAbs);
    // console.log(`Copying runtime...`);
    // return copy(runtimePath, join(config.electron.webDirAbs, 'capacitor.js'));
  });
}
