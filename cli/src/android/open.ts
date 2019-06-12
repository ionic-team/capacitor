import { Config } from '../config';
import { OS } from '../definitions';
import { logError, logInfo } from '../common';
import { existsAsync } from '../util/fs';
import { resolve } from 'path';

export async function openAndroid(config: Config) {
  logInfo(`Opening Android project at ${config.android.platformDir}`);

  if (!await existsAsync(resolve(config.app.rootDir, config.android.platformDir))) {
    throw new Error('Android project does not exist. Create one with "npx cap add android"');
  }

  const opn = await import('open');

  const dir = config.android.platformDir;

  switch (config.cli.os) {
    case OS.Mac:
      await opn(dir, { app: 'android studio', wait: false });
      break;
    case OS.Windows:
      if (config.windows.androidStudioPath) {
        opn(dir, { app: config.windows.androidStudioPath, wait: false });
      } else {
        logError('Unable to launch Android Studio. Make sure the latest version of Android Studio is installed')
      }
      break;
    case OS.Linux:
      const linuxError = () => {
        logError('Unable to launch Android Studio. You must configure "linuxAndroidStudioPath" ' +
                 'in your capacitor.config.json to point to the location of studio.sh, using JavaScript-escaped paths:\n' +

                 'Example:\n' +
                 '{\n' +
                    '  "linuxAndroidStudioPath": "/usr/local/android-studio/bin/studio.sh"\n' +
                  '}');
      };

      try {
        await opn(dir, { app: config.linux.androidStudioPath, wait: false });
      } catch (e) {
        linuxError();
      }
      break;
  }

}
