import Debug from 'debug';
import { resolve } from 'path';

import c from '../colors.js';
import { parseApkNameFromFlavor, promptForPlatformTarget, runTask } from '../common.js';
import type { Config } from '../definitions.js';
import type { RunCommandOptions } from '../tasks/run.js';
import { runNativeRun, getPlatformTargets } from '../util/native-run.js';
import { runCommand } from '../util/subprocess.js';

const debug = Debug('capacitor:android:run');

export async function runAndroid(
  config: Config,
  {
    target: selectedTarget,
    targetName: selectedTargetName,
    targetNameSdkVersion: selectedTargetSdkVersion,
    flavor: selectedFlavor,
    forwardPorts: selectedPorts,
  }: RunCommandOptions,
): Promise<void> {
  const target = await promptForPlatformTarget(
    await getPlatformTargets('android'),
    selectedTarget ?? selectedTargetName,
    selectedTargetSdkVersion,
    selectedTargetName !== undefined,
  );

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
