import open from 'open';

import c from '../colors';
import type { Config } from '../definitions';
import { logger } from '../log';

export async function openAndroid(config: Config): Promise<void> {
  logger.info(`Opening Android project at ${config.android.platformDir}.`);

  const androidStudioPath = config.android.studioPath;
  const dir = config.android.platformDirAbs;

  try {
    await open(dir, { app: androidStudioPath, wait: false });
  } catch (e) {
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
