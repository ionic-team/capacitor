import { pathExists } from '@ionic/utils-fs';
import Debug from 'debug';

import { input, strong } from '../colors';
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

    const open = await import('open');
    await open.default(dir, { app: androidStudioPath, wait: false });
    logger.info(
      `Opening Android project at: ${strong(config.android.platformDir)}.`,
    );
  } catch (e) {
    debug('Error opening Android Studio: %O', e);

    logger.error(
      'Unable to launch Android Studio. Is it installed?\n' +
        `Attempted to open Android Studio at: ${strong(androidStudioPath)}\n` +
        `You can configure this with the ${input(
          'STUDIO_PATH',
        )} environment variable.`,
    );
  }
}
