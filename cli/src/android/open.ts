import { pathExists } from '@ionic/utils-fs';
import Debug from 'debug';
import open from 'open';

import c from '../colors';
import type { Config } from '../definitions';
import { logger } from '../log';

const debug = Debug('capacitor:android:open');

export async function openAndroid(config: Config): Promise<void> {
  const androidStudioPath = config.android.studioPath;
  const dir = config.android.platformDirAbs;

  try {
    if (!(await pathExists(androidStudioPath))) {
      throw new Error(`Android Studio does not exist at: ${androidStudioPath}`);
    }

    await open(dir, { app: androidStudioPath, wait: false });
    logger.info(
      `Opening Android project at: ${c.strong(config.android.platformDir)}.`,
    );
  } catch (e) {
    debug('Error opening Android Studio: %O', e);

    logger.error(
      'Unable to launch Android Studio. Is it installed?\n' +
        `Attempted to open Android Studio at: ${c.strong(
          androidStudioPath,
        )}\n` +
        `You can configure this with the ${c.input(
          'STUDIO_PATH',
        )} environment variable.`,
    );
  }
}
