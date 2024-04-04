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

  const releaseDir = releaseTypeIsAAB
    ? flavor !== ''
      ? `${flavor}Release`
      : 'release'
    : flavor !== ''
    ? join(flavor, 'release')
    : 'release';

  const releasePath = join(
    config.android.appDirAbs,
    'build',
    'outputs',
    releaseTypeIsAAB ? 'bundle' : 'apk',
    releaseDir,
  );

  const unsignedReleaseName = `app${flavor !== '' ? `-${flavor}` : ''}-release${
    releaseTypeIsAAB ? '' : '-unsigned'
  }.${releaseType.toLowerCase()}`;

  const signedReleaseName = unsignedReleaseName.replace(
    `-release${
      releaseTypeIsAAB ? '' : '-unsigned'
    }.${releaseType.toLowerCase()}`,
    `-release-signed.${releaseType.toLowerCase()}`,
  );

  if (buildOptions.signingtype == 'jarsigner') {
    await signWithJarSigner(
      config,
      buildOptions,
      releasePath,
      signedReleaseName,
      unsignedReleaseName,
    );
  } else {
    await signWithApkSigner(
      config,
      buildOptions,
      releasePath,
      signedReleaseName,
      unsignedReleaseName,
    );
  }

  logSuccess(`Successfully generated ${signedReleaseName} at: ${releasePath}`);
}

async function signWithApkSigner(
  config: Config,
  buildOptions: BuildCommandOptions,
  releasePath: string,
  signedReleaseName: string,
  unsignedReleaseName: string,
) {
  if (!buildOptions.keystorepath || !buildOptions.keystorepass) {
    throw 'Missing options. Please supply all options for android signing. (Keystore Path, Keystore Password)';
  }

  const signingArgs = [
    'sign',
    '--ks',
    buildOptions.keystorepath,
    '--ks-pass',
    `pass:${buildOptions.keystorepass}`,
    '--in',
    `${join(releasePath, unsignedReleaseName)}`,
    '--out',
    `${join(releasePath, signedReleaseName)}`,
  ];

  if (buildOptions.keystorealias) {
    signingArgs.push('--ks-key-alias', buildOptions.keystorealias);
  }

  if (buildOptions.keystorealiaspass) {
    signingArgs.push('--key-pass', `pass:${buildOptions.keystorealiaspass}`);
  }

  await runTask('Signing Release', async () => {
    await runCommand('apksigner', signingArgs, {
      cwd: config.android.platformDirAbs,
    });
  });
}

async function signWithJarSigner(
  config: Config,
  buildOptions: BuildCommandOptions,
  releasePath: string,
  signedReleaseName: string,
  unsignedReleaseName: string,
) {
  if (
    !buildOptions.keystorepath ||
    !buildOptions.keystorealias ||
    !buildOptions.keystorealiaspass ||
    !buildOptions.keystorepass
  ) {
    throw 'Missing options. Please supply all options for android signing. (Keystore Path, Keystore Password, Keystore Key Alias, Keystore Key Password)';
  }

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
}
