import Debug from 'debug';
import { resolve } from 'path';

import c from '../colors';
import { promptForPlatformTarget, runTask } from '../common';
import type { Config } from '../definitions';
import type { RunCommandOptions } from '../tasks/run';
import { runNativeRun, getPlatformTargets } from '../util/native-run';
import { runCommand } from '../util/subprocess';

const debug = Debug('capacitor:android:run');

export async function runAndroid(
  config: Config,
  { target: selectedTarget }: RunCommandOptions,
): Promise<void> {
  const target = await promptForPlatformTarget(
    await getPlatformTargets('android'),
    selectedTarget,
  );

  const arg = `assemble${config.android?.flavor || ''}Debug`;
  const gradleArgs = [arg];

  debug('Invoking ./gradlew with args: %O', gradleArgs);

  try {
    await runTask('Running Gradle build', async () =>
      runCommand('./gradlew', gradleArgs, {
        cwd: config.android.platformDirAbs,
      }),
    );
  } catch (e) {
    if (e.includes('EACCES')) {
      throw `gradlew file does not have executable permissions. This can happen if the Android platform was added on a Windows machine. Please run ${c.strong(
        `chmod +x ./${config.android.platformDir}/gradlew`,
      )} and try again.`;
    } else {
      throw e;
    }
  }

  const apkPath = resolve(
    config.android.buildOutputDirAbs,
    config.android.apkName,
  );

  const nativeRunArgs = ['android', '--app', apkPath, '--target', target.id];

  debug('Invoking native-run with args: %O', nativeRunArgs);

  await runTask(
    `Deploying ${c.strong(config.android.apkName)} to ${c.input(target.id)}`,
    async () => runNativeRun(nativeRunArgs),
  );
}
