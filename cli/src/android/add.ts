import { pathExists, writeFile } from '@ionic/utils-fs';
import { homedir } from 'os';
import { join } from 'path';

import c from '../colors';
import { copyTemplate, runCommand, runTask } from '../common';
import type { Config } from '../definitions';

export async function addAndroid(config: Config): Promise<void> {
  await runTask(
    `Adding native android project in ${c.strong(config.android.platformDir)}`,
    async () => {
      return copyTemplate(
        config.android.assets.templateDir,
        config.android.platformDirAbs,
      );
    },
  );

  await runTask('Syncing Gradle', async () => {
    return createLocalProperties(config.android.platformDirAbs);
  });
}

async function createLocalProperties(platformDir: string) {
  const defaultAndroidPath = join(homedir(), 'Library/Android/sdk');
  if (await pathExists(defaultAndroidPath)) {
    const localSettings = `
## This file is automatically generated by Android Studio.
# Do not modify this file -- YOUR CHANGES WILL BE ERASED!
#
# This file should *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For customization when using a Version Control System, please read the
# header note.
sdk.dir=${defaultAndroidPath}
  `;
    await writeFile(join(platformDir, 'local.properties'), localSettings, {
      encoding: 'utf-8',
    });

    // Only sync if we were able to create the local properties above, otherwise
    // this will fail
    try {
      await gradleSync(platformDir);
    } catch (e) {
      console.error('Error running gradle sync', e);
      console.error(
        'Unable to infer default Android SDK settings. This is fine, just run npx cap open android and import and sync gradle manually',
      );
    }
  }
}

async function gradleSync(platformDir: string) {
  await runCommand(`${platformDir}/gradlew`, []);
}
