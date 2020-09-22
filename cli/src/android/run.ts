import { resolve } from 'path';

import c from '../colors';
import { runCommand, runTask } from '../common';
import type { Config } from '../definitions';

export async function runAndroid(config: Config): Promise<void> {
  const projectRoot = config.android.platformDir;

  await runTask('Running Gradle build', async () =>
    runCommand('./gradlew', ['assembleDebug'], { cwd: projectRoot }),
  );

  const apkName = 'app-debug.apk';
  const apkPath = resolve(config.android.buildOutputDirAbs, apkName);

  await runTask(`Deploying ${c.strong(apkName)} to device`, async () =>
    runCommand('native-run', ['android', '--app', apkPath]),
  );
}
