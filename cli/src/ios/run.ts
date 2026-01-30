import Debug from 'debug';
import { basename, resolve } from 'path';

import c from '../colors.js';
import { promptForPlatformTarget, runTask } from '../common.js';
import type { Config } from '../definitions.js';
import type { RunCommandOptions } from '../tasks/run.js';
import { runNativeRun, getPlatformTargets } from '../util/native-run.js';
import { checkPackageManager } from '../util/spm.js';
import { runCommand } from '../util/subprocess.js';

const debug = Debug('capacitor:ios:run');

export async function runIOS(
  config: Config,
  {
    target: selectedTarget,
    targetName: selectedTargetName,
    targetNameSdkVersion: selectedTargetSdkVersion,
    scheme: selectedScheme,
    configuration: selectedConfiguration,
  }: RunCommandOptions,
): Promise<void> {
  const target = await promptForPlatformTarget(
    await getPlatformTargets('ios'),
    selectedTarget ?? selectedTargetName,
    selectedTargetSdkVersion,
    selectedTargetName !== undefined,
  );

  const runScheme = selectedScheme || config.ios.scheme;
  const configuration = selectedConfiguration || 'Debug';

  const derivedDataPath = resolve(config.ios.platformDirAbs, 'DerivedData', target.id);

  const packageManager = await checkPackageManager(config);

  let typeOfBuild: string;
  let projectName: string;

  if (packageManager == 'Cocoapods') {
    typeOfBuild = '-workspace';
    projectName = basename(await config.ios.nativeXcodeWorkspaceDirAbs);
  } else {
    typeOfBuild = '-project';
    projectName = basename(await config.ios.nativeXcodeProjDirAbs);
  }

  const xcodebuildArgs = [
    typeOfBuild,
    projectName,
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
    target.virtual ? `${configuration}-iphonesimulator` : `${configuration}-iphoneos`,
    appName,
  );

  const nativeRunArgs = ['ios', '--app', appPath, '--target', target.id];

  debug('Invoking native-run with args: %O', nativeRunArgs);

  await runTask(`Deploying ${c.strong(appName)} to ${c.input(target.id)}`, async () => runNativeRun(nativeRunArgs));
}
