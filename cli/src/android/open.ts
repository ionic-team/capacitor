import Debug from 'debug';
import { pathExists } from 'fs-extra';
import open from 'open';

import c from '../colors.js';
import type { Config } from '../definitions.js';
import { logger } from '../log.js';

const debug = Debug('capacitor:android:open');

export async function openAndroid(config: Config): Promise<void> {
  const androidStudioPath = await config.android.studioPath;
  const dir = config.android.platformDirAbs;

  try {
    if (!(await pathExists(androidStudioPath))) {
      throw new Error(`Android Studio does not exist at: ${androidStudioPath}`);
    }

    await open(dir, { app: { name: androidStudioPath }, wait: false });
    logger.info(`Opening Android project at: ${c.strong(config.android.platformDir)}.`);
  } catch (e) {
    debug('Error opening Android Studio: %O', e);

    logger.error(
      'Unable to launch Android Studio. Is it installed?\n' +
        `Attempted to open Android Studio at: ${c.strong(androidStudioPath)}\n` +
        `You can configure this with the ${c.input('CAPACITOR_ANDROID_STUDIO_PATH')} environment variable.`,
    );
  }
}
