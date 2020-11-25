import { copy } from '@ionic/utils-fs';
import { join } from 'path';

import c from '../colors';
import { runTask } from '../common';
import type { Config } from '../definitions';
import { logFatal } from '../log';
import { resolveNode } from '../util/node';

export async function copyWeb(config: Config): Promise<void> {
  if (config.app.bundledWebRuntime) {
    const runtimePath = resolveNode(
      config.app.rootDir,
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
