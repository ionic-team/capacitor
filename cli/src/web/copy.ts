import { logFatal, resolveNode, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';
import { join } from 'path';

export async function copyWeb(config: Config) {
  if (config.app.bundledWebRuntime) {
    const runtimePath = resolveNode(config, '@capacitor/core', 'dist', 'capacitor.js');
    if (!runtimePath) {
      logFatal(`Unable to find node_modules/@capacitor/core/dist/capacitor.js. Are you sure`,
        '@capacitor/core is installed? This file is required for Capacitor to function');
      return;
    }

    return runTask(`Copying capacitor.js to web dir`, () => {
      return copy(runtimePath, join(config.app.webDirAbs, 'capacitor.js'));
    });
  }
}
