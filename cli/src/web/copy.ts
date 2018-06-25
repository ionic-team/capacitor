import { runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';
import { join, resolve } from 'path';

export async function copyWeb(config: Config) {
  if (config.app.bundledWebRuntime) {
    const runtimePath = resolve(config.app.rootDir, 'node_modules', '@capacitor/core', 'dist/capacitor.js');
    return runTask(`Copying capacitor.js to web dir`, () => {
      return copy(runtimePath, join(config.app.webDirAbs, 'capacitor.js'));
    });
  }
}
