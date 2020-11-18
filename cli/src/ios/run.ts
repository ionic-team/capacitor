import Debug from 'debug';
import { resolve } from 'path';

import c from '../colors';
import { promptForPlatformTarget, runTask } from '../common';
import type { Config } from '../definitions';
import type { RunCommandOptions } from '../tasks/run';
import { runNativeRun, getPlatformTargets } from '../util/native-run';
import { runCommand } from '../util/subprocess';

const debug = Debug('capacitor:ios:run');

export async function runIOS(
  config: Config,
  { target: selectedTarget }: RunCommandOptions,
): Promise<void> {
  const target = await promptForPlatformTarget(
    await getPlatformTargets('ios'),
    selectedTarget,
  );

  const derivedDataPath = resolve(
    config.ios.platformDirAbs,
    'DerivedData',
    target.id,
  );

  const xcodebuildArgs = [
    '-workspace',
    'App.xcworkspace',
    '-scheme',
    'App',
    '-configuration',
    'debug',
    '-destination',
    `id=${target.id}`,
    '-derivedDataPath',
    derivedDataPath,
  ];

  debug('Invoking xcodebuild with args: %O', xcodebuildArgs);

  await runTask('Running xcodebuild', async () =>
    runCommand('xcrun', ['xcodebuild', ...xcodebuildArgs], {
      cwd: resolve(config.ios.platformDirAbs, 'App'),
    }),
  );

  const appName = 'App.app';
  const appPath = resolve(
    derivedDataPath,
    'Build/Products',
    target.virtual ? 'Release-iphonesimulator' : 'Release-iphoneos',
    appName,
  );

  const nativeRunArgs = ['ios', '--app', appPath, '--target', target.id];

  debug('Invoking native-run with args: %O', nativeRunArgs);

  await runTask(
    `Deploying ${c.strong(appName)} to ${c.input(target.id)}`,
    async () => runNativeRun(nativeRunArgs),
  );
}
