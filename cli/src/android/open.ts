import { Config } from '../config';
import { OS } from '../definitions';
import { logError, logInfo, runCommand } from '../common';
import { existsAsync, existsSync } from '../util/fs';
import { resolve } from 'path';
import open from 'open';

export async function openAndroid(config: Config) {
  logInfo(`Opening Android project at ${config.android.platformDir}`);

  if (
    !(await existsAsync(
      resolve(config.app.rootDir, config.android.platformDir),
    ))
  ) {
    throw new Error(
      'Android project does not exist. Create one with "npx cap add android"',
    );
  }

  const dir = config.android.platformDir;

  switch (config.cli.os) {
    case OS.Mac:
      await open(dir, { app: 'android studio', wait: false });
      break;
    case OS.Windows:
      let androidStudioPath = config.windows.androidStudioPath;
      try {
        if (!existsSync(androidStudioPath)) {
          let commandResult = await runCommand(
            'REG QUERY "HKEY_LOCAL_MACHINE\\SOFTWARE\\Android Studio" /v Path',
          );
          commandResult = commandResult.replace(/(\r\n|\n|\r)/gm, '');
          const ix = commandResult.indexOf('REG_SZ');
          if (ix > 0) {
            androidStudioPath =
              commandResult.substring(ix + 6).trim() + '\\bin\\studio64.exe';
          }
        }
      } catch (e) {
        androidStudioPath = '';
      }
      if (androidStudioPath) {
        open(dir, { app: androidStudioPath, wait: false });
      } else {
        logError(
          'Android Studio not found. Make sure it\'s installed and configure "windowsAndroidStudioPath" ' +
            'in your capacitor.config.json to point to the location of studio64.exe, using JavaScript-escaped paths:\n' +
            'Example:\n' +
            '{\n' +
            '  "windowsAndroidStudioPath": "C:\\\\Program Files\\\\Android\\\\Android Studio\\\\bin\\\\studio64.exe"\n' +
            '}',
        );
      }
      break;
    case OS.Linux:
      const linuxError = () => {
        logError(
          'Unable to launch Android Studio. You must configure "linuxAndroidStudioPath" ' +
            'in your capacitor.config.json to point to the location of studio.sh, using JavaScript-escaped paths:\n' +
            'Example:\n' +
            '{\n' +
            '  "linuxAndroidStudioPath": "/usr/local/android-studio/bin/studio.sh"\n' +
            '}',
        );
      };

      try {
        await open(dir, { app: config.linux.androidStudioPath, wait: true });
      } catch (e) {
        linuxError();
      }
      break;
  }
}
