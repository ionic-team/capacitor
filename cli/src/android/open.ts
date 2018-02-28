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

  const opn = await import('opn');

  const dir = config.android.platformDir;

  switch (config.cli.os) {
    case OS.Mac:
      await opn(dir, { app: 'android studio', wait: false });
      break;
    case OS.Windows:
      try {
        await opn(dir, { app: config.windows.androidStudioPath, wait: true });
      } catch (e) {
        logError('Unable to launch Android Studio. Make sure the latest version of Android Studio is installed, or,' +
                 'if you\'ve installed Android Studio in a custom location, configure "windowsAndroidStudioPath" ' +
                 'your capacitor.config.json to point to the location of studio64.exe, using JavaScript-escaped paths:\n' +

                 'Example:\n' +
                 '{\n' +
                    '  "windowsAndroidStudioPath": "H:\\\\Android Studio\\\\bin\\\\studio64.exe"\n' +
                  '}');
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
        await opn(dir, { app: config.linux.androidStudioPath, wait: true });
      } catch (e) {
        linuxError();
      }
      break;
  }

}
