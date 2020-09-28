import { resolve } from 'path';

import c from '../colors';
import {
  runCommand,
  runTask,
  promptForPlatformTarget,
  getPlatformTargets,
} from '../common';
import type { Config } from '../definitions';
import type { RunCommandOptions } from '../tasks/run';

export async function runAndroid(
  config: Config,
  { target: selectedTarget }: RunCommandOptions,
): Promise<void> {
  const target = await promptForPlatformTarget(
    await getPlatformTargets('android'),
    selectedTarget,
  );

  const projectRoot = config.android.platformDir;

  await runTask('Running Gradle build', async () =>
    runCommand('./gradlew', ['assembleDebug'], { cwd: projectRoot }),
  );

  const apkName = 'app-debug.apk';
  const apkPath = resolve(config.android.buildOutputDirAbs, apkName);

  await runTask(
    `Deploying ${c.strong(apkName)} to ${c.input(target)}`,
    async () =>
      runCommand('native-run', [
        'android',
        '--app',
        apkPath,
        '--target',
        target,
      ]),
  );
}
