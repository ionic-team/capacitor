import { runCommand, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';
import { join, relative, resolve } from 'path';

export async function copyElectron(config: Config) {
  const chalk = require('chalk');
  console.log('Copying runtime!');
  const runtimePath = resolve(config.app.rootDir, 'node_modules', '@capacitor/core', 'dist/capacitor.js');
  return runTask(`Copying capacitor.js to electron app.`, () => {
    return copy(runtimePath, join(config.electron.webDirAbs, 'capacitor.js'));
  });
}