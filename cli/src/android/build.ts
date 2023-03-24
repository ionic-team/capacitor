import { join } from 'path';

import c from '../colors';
import { runTask } from '../common';
import type { Config } from '../definitions';
import { logSuccess } from '../log';
import type { BuildCommandOptions } from '../tasks/build';
import { runCommand } from '../util/subprocess';

export async function buildAndroid(
  config: Config,
  buildOptions: BuildCommandOptions,
): Promise<void> {
  const releaseType = buildOptions.androidreleasetype ?? 'AAB';
  const releaseTypeIsAAB = releaseType === 'AAB';
  const flavor = buildOptions.flavor ?? '';
  const arg = releaseTypeIsAAB
    ? `:app:bundle${flavor}Release`
    : `assemble${flavor}Release`;
  const gradleArgs = [arg];

  if (
    !buildOptions.keystorepath ||
    !buildOptions.keystorealias ||
    !buildOptions.keystorealiaspass ||
    !buildOptions.keystorepass
  ) {
    throw 'Missing options. Please supply all options for android signing. (Keystore Path, Keystore Password, Keystore Key Alias, Keystore Key Password)';
  }

  try {
    await runTask('Running Gradle build', async () =>
      runCommand('./gradlew', gradleArgs, {
        cwd: config.android.platformDirAbs,
      }),
    );
  } catch (e) {
    if ((e as any).includes('EACCES')) {
      throw `gradlew file does not have executable permissions. This can happen if the Android platform was added on a Windows machine. Please run ${c.strong(
        `chmod +x ./${config.android.platformDir}/gradlew`,
      )} and try again.`;
    } else {
      throw e;
    }
  }

  const releasePath = join(
    config.android.appDirAbs,
    'build',
    'outputs',
    releaseTypeIsAAB ? 'bundle' : 'apk',
    buildOptions.flavor ? `${flavor}Release` : 'release',
  );

  const unsignedReleaseName = `app${
    config.android.flavor ? `-${config.android.flavor}` : ''
  }-release${releaseTypeIsAAB ? '' : '-unsigned'}.${releaseType.toLowerCase()}`;

  const signedReleaseName = unsignedReleaseName.replace(
    `-release${
      releaseTypeIsAAB ? '' : '-unsigned'
    }.${releaseType.toLowerCase()}`,
    `-release-signed.${releaseType.toLowerCase()}`,
  );

  const signingArgs = [
    '-sigalg',
    'SHA1withRSA',
    '-digestalg',
    'SHA1',
    '-keystore',
    buildOptions.keystorepath,
    '-keypass',
    buildOptions.keystorealiaspass,
    '-storepass',
    buildOptions.keystorepass,
    `-signedjar`,
    `${join(releasePath, signedReleaseName)}`,
    `${join(releasePath, unsignedReleaseName)}`,
    buildOptions.keystorealias,
  ];

  await runTask('Signing Release', async () => {
    await runCommand('jarsigner', signingArgs, {
      cwd: config.android.platformDirAbs,
    });
  });

  logSuccess(`Successfully generated ${signedReleaseName} at: ${releasePath}`);
}
