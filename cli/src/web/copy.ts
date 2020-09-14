import c from '../colors';
import { logFatal, resolveNode, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';
import { join } from 'path';

export async function copyWeb(config: Config) {
  if (config.app.bundledWebRuntime) {
    const runtimePath = resolveNode(
      config,
      '@capacitor/core',
      'dist',
      'capacitor.js',
    );
    if (!runtimePath) {
      logFatal(
        `Unable to find node_modules/@capacitor/core/dist/capacitor.js.\n` +
          `Are you sure ${c.strong('@capacitor/core')} is installed?`,
      );
    }

    return runTask(`Copying ${c.strong('capacitor.js')} to web dir`, () => {
      return copy(runtimePath, join(config.app.webDirAbs, 'capacitor.js'));
    });
  }
}
