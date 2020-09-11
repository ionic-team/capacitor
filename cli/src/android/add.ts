import { homedir } from 'os';
import { join, relative } from 'path';

import c from '../colors';
import { copyTemplate, runCommand, runTask, CheckFunction } from '../common';
import { Config } from '../config';
import { existsAsync, writeFileAsync } from '../util/fs';

import { checkAndroidPackage } from './common';

export const addAndroidChecks: CheckFunction[] = [checkAndroidPackage];

export async function addAndroid(config: Config): Promise<void> {
  const nativeRelDir = relative(config.app.rootDir, config.android.platformDir);
  await runTask(
    `Adding native android project in ${c.strong(nativeRelDir)}`,
    async () => {
      return copyTemplate(
        config.android.assets.templateDir,
        config.android.platformDir,
      );
    },
  );

  await runTask('Syncing Gradle', async () => {
    return createLocalProperties(config.android.platformDir);
  });
}

async function createLocalProperties(platformDir: string) {
  const defaultAndroidPath = join(homedir(), 'Library/Android/sdk');
  if (await existsAsync(defaultAndroidPath)) {
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
    await writeFileAsync(
      join(platformDir, 'local.properties'),
      localSettings,
      'utf8',
    );

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
  await runCommand(`${platformDir}/gradlew`);
}
