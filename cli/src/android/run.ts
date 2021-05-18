import Debug from 'debug';
import { resolve } from 'path';

import c from '../colors';
import { promptForPlatformTarget, runTask } from '../common';
import { runNativeRun, getPlatformTargets } from '../util/native-run';
import { runCommand } from '../util/subprocess';

import type { Config } from '../definitions';
import type { RunCommandOptions } from '../tasks/run';

const debug = Debug('capacitor:android:run');

export async function runAndroid(
  config: Config,
  { target: selectedTarget }: RunCommandOptions,
): Promise<void> {
  const target = await promptForPlatformTarget(
    await getPlatformTargets('android'),
    selectedTarget,
  );

  const gradleArgs = ['assembleDebug'];

  debug('Invoking ./gradlew with args: %O', gradleArgs);

  await runTask('Running Gradle build', async () =>
    runCommand('./gradlew', gradleArgs, {
      cwd: config.android.platformDirAbs,
    }),
  );

  const apkName = 'app-debug.apk';
  const apkPath = resolve(config.android.buildOutputDirAbs, apkName);

  const nativeRunArgs = ['android', '--app', apkPath, '--target', target.id];

  debug('Invoking native-run with args: %O', nativeRunArgs);

  await runTask(
    `Deploying ${c.strong(apkName)} to ${c.input(target.id)}`,
    async () => runNativeRun(nativeRunArgs),
  );
}
