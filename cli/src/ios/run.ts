import Debug from 'debug';
import { basename, resolve } from 'path';

import c from '../colors';
import { promptForPlatformTarget, runTask } from '../common';
import type { Config } from '../definitions';
import type { RunCommandOptions } from '../tasks/run';
import { runNativeRun, getPlatformTargets } from '../util/native-run';
import { runCommand } from '../util/subprocess';

const debug = Debug('capacitor:ios:run');

export async function runIOS(
  config: Config,
  {
    target: selectedTarget,
    scheme: selectedScheme,
    configuration: selectedConfiguration,
  }: RunCommandOptions,
): Promise<void> {
  const target = await promptForPlatformTarget(
    await getPlatformTargets('ios'),
    selectedTarget,
  );

  const runScheme = selectedScheme || config.ios.scheme;
  const configuration = selectedConfiguration || 'Debug';

  const derivedDataPath = resolve(
    config.ios.platformDirAbs,
    'DerivedData',
    target.id,
  );

  const xcodebuildArgs = [
    '-workspace',
    basename(await config.ios.nativeXcodeWorkspaceDirAbs),
    '-scheme',
    runScheme,
    '-configuration',
    configuration,
    '-destination',
    `id=${target.id}`,
    '-derivedDataPath',
    derivedDataPath,
  ];

  debug('Invoking xcodebuild with args: %O', xcodebuildArgs);

  await runTask('Running xcodebuild', async () =>
    runCommand('xcrun', ['xcodebuild', ...xcodebuildArgs], {
      cwd: config.ios.nativeProjectDirAbs,
    }),
  );

  const appName = `${runScheme}.app`;
  const appPath = resolve(
    derivedDataPath,
    'Build/Products',
    target.virtual
      ? `${configuration}-iphonesimulator`
      : `${configuration}-iphoneos`,
    appName,
  );

  const nativeRunArgs = ['ios', '--app', appPath, '--target', target.id];

  debug('Invoking native-run with args: %O', nativeRunArgs);

  await runTask(
    `Deploying ${c.strong(appName)} to ${c.input(target.id)}`,
    async () => runNativeRun(nativeRunArgs),
  );
}
