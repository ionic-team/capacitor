import { writeFileSync, unlinkSync } from 'fs-extra';
import { basename, join } from 'path';
import { rimraf } from 'rimraf';

import { runTask } from '../common';
import { XcodeExportMethod, type Config } from '../definitions';
import { logSuccess } from '../log';
import { type BuildCommandOptions } from '../tasks/build';
import { checkPackageManager } from '../util/spm';
import { runCommand } from '../util/subprocess';

export async function buildiOS(config: Config, buildOptions: BuildCommandOptions): Promise<void> {
  const theScheme = buildOptions.scheme ?? 'App';

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

  if (
    buildOptions.xcodeSigningType == 'manual' &&
    (!buildOptions.xcodeSigningCertificate || !buildOptions.xcodeProvisioningProfile)
  ) {
    throw 'Manually signed Xcode builds require a signing certificate and provisioning profile.';
  }

  const buildArgs = [
    typeOfBuild,
    projectName,
    '-scheme',
    `${theScheme}`,
    '-destination',
    `generic/platform=iOS`,
    '-archivePath',
    `${theScheme}.xcarchive`,
    'archive',
  ];

  if (buildOptions.xcodeTeamId) {
    buildArgs.push(`DEVELOPMENT_TEAM=${buildOptions.xcodeTeamId}`);
  }

  if (buildOptions.xcodeSigningType == 'manual') {
    buildArgs.push(`PROVISIONING_PROFILE_SPECIFIER=${buildOptions.xcodeProvisioningProfile}`);
  }

  await runTask('Building xArchive', async () =>
    runCommand('xcodebuild', buildArgs, {
      cwd: config.ios.nativeProjectDirAbs,
    }),
  );

  const manualSigningContents = `<key>provisioningProfiles</key>
<dict>
<key>${config.app.appId}</key>
<string>${buildOptions.xcodeProvisioningProfile ?? ''}</string>
</dict>
<key>signingCertificate</key>
<string>${buildOptions.xcodeSigningCertificate ?? ''}</string>`;

  const archivePlistContents = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>method</key>
<string>${buildOptions.xcodeExportMethod ?? XcodeExportMethod.Debugging}</string>
<key>signingStyle</key>
<string>${buildOptions.xcodeSigningType}</string>
${buildOptions.xcodeSigningType == 'manual' ? manualSigningContents : ''}
</dict>
</plist>`;

  const archivePlistPath = join(`${config.ios.nativeProjectDirAbs}`, 'archive.plist');

  writeFileSync(archivePlistPath, archivePlistContents);

  const archiveArgs = [
    'archive',
    '-archivePath',
    `${theScheme}.xcarchive`,
    '-exportArchive',
    '-exportOptionsPlist',
    'archive.plist',
    '-exportPath',
    'output',
    '-configuration',
    buildOptions.configuration,
  ];

  if (buildOptions.xcodeSigningType == 'automatic') {
    archiveArgs.push('-allowProvisioningUpdates');
  }

  await runTask('Building IPA', async () =>
    runCommand('xcodebuild', archiveArgs, {
      cwd: config.ios.nativeProjectDirAbs,
    }),
  );

  await runTask('Cleaning up', async () => {
    unlinkSync(archivePlistPath);
    rimraf.sync(join(config.ios.nativeProjectDirAbs, `${theScheme}.xcarchive`));
  });

  logSuccess(`Successfully generated an IPA at: ${join(config.ios.nativeProjectDirAbs, 'output')}`);
}
