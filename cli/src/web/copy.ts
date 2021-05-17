import { copy } from '@ionic/utils-fs';
import { join } from 'path';

import c from '../colors';
import { runTask } from '../common';
import { fatal } from '../errors';
import { resolveNode } from '../util/node';

import type { Config } from '../definitions';

export async function copyWeb(config: Config): Promise<void> {
  if (config.app.bundledWebRuntime) {
    const runtimePath = resolveNode(
      config.app.rootDir,
      '@capacitor/core',
      'dist',
      'capacitor.js',
    );
    if (!runtimePath) {
      fatal(
        `Unable to find ${c.strong(
          'node_modules/@capacitor/core/dist/capacitor.js',
        )}.\n` + `Are you sure ${c.strong('@capacitor/core')} is installed?`,
      );
    }

    return runTask(`Copying ${c.strong('capacitor.js')} to web dir`, () => {
      return copy(runtimePath, join(config.app.webDirAbs, 'capacitor.js'));
    });
  }
}
