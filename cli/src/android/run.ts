import Debug from 'debug';
import { pathExists, readFile, writeFile } from 'fs-extra';

import { resolve, join } from 'path';

import c from '../colors';
import { parseApkNameFromFlavor, promptForPlatformTarget, runTask } from '../common';
import type { Config } from '../definitions';
import type { RunCommandOptions } from '../tasks/run';
import { runNativeRun, getPlatformTargets } from '../util/native-run';
import { runCommand } from '../util/subprocess';

const debug = Debug('capacitor:android:run');

export async function runAndroid(
  config: Config,
  { target: selectedTarget, flavor: selectedFlavor, forwardPorts: selectedPorts }: RunCommandOptions,
): Promise<void> {
  const target = await promptForPlatformTarget(await getPlatformTargets('android'), selectedTarget);

  const runFlavor = selectedFlavor || config.android?.flavor || '';

  const arg = `assemble${runFlavor}Debug`;
  const gradleArgs = [arg];

  debug('Invoking ./gradlew with args: %O', gradleArgs);

  try {
    await runTask('Running Gradle build', async () =>
      runCommand('./gradlew', gradleArgs, {
        cwd: config.android.platformDirAbs,
      }),
    );
  } catch (e: any) {
    if (e.includes('EACCES')) {
      throw `gradlew file does not have executable permissions. This can happen if the Android platform was added on a Windows machine. Please run ${c.strong(
        `chmod +x ./${config.android.platformDir}/gradlew`,
      )} and try again.`;
    } else {
      throw e;
    }
  }

  const pathToApk = `${config.android.platformDirAbs}/${
    config.android.appDir
  }/build/outputs/apk${runFlavor !== '' ? '/' + runFlavor : ''}/debug`;

  const apkName = parseApkNameFromFlavor(runFlavor);
  const apkPath = resolve(pathToApk, apkName);

  const nativeRunArgs = ['android', '--app', apkPath, '--target', target.id];

  if (selectedPorts) {
    nativeRunArgs.push('--forward', `${selectedPorts}`);
  }

  debug('Invoking native-run with args: %O', nativeRunArgs);

  await runTask(`Deploying ${c.strong(apkName)} to ${c.input(target.id)}`, async () => runNativeRun(nativeRunArgs));
}

export async function writeAndroidManifest(config: Config, cleartext?: boolean): Promise<void> {
  const manifestPath = join(config.android.appDirAbs, 'src', 'main', 'AndroidManifest.xml');

  let manifestFile = await readFile(manifestPath, { encoding: 'utf-8' });
  const cleartextProperty = 'android:usesCleartextTraffic';

  if (cleartext === true && !manifestFile.includes(cleartextProperty)) {
    manifestFile = manifestFile.replace('<application', `<application ${cleartextProperty}="true"`);
  }

  if (cleartext === false && manifestFile.includes(cleartextProperty)) {
    manifestFile = manifestFile.replace(`${cleartextProperty}="true"`, '');
  }

  await writeFile(manifestPath, manifestFile, { encoding: 'utf-8' });
}
