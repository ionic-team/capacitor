import { runCommand, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';
import { join, relative, resolve } from 'path';

export async function copyWeb(config: Config) {
  const chalk = require('chalk');
  if (config.app.bundledWebRuntime) {
    const runtimePath = resolve('node_modules', '@capacitor/core', 'dist/capacitor.js');
    const relativeWebDir = relative(config.app.rootDir, config.app.webDir);
    return runTask(`Copying capacitor.js to web dir ${chalk.bold(relativeWebDir)}/`, () => {
      return copy(runtimePath, join(config.app.webDir, 'capacitor.js'));
    });
  }
}
