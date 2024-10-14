import { writeFileSync, unlinkSync } from '@ionic/utils-fs';
import { basename, join } from 'path';
import rimraf from 'rimraf';

import { runTask } from '../common';
import type { Config } from '../definitions';
import { logSuccess } from '../log';
import type { BuildCommandOptions } from '../tasks/build';
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

  await runTask('Building xArchive', async () =>
    runCommand(
      'xcodebuild',
      [
        typeOfBuild,
        projectName,
        '-scheme',
        `${theScheme}`,
        '-destination',
        `generic/platform=iOS`,
        '-archivePath',
        `${theScheme}.xcarchive`,
        'archive',
      ],
      {
        cwd: config.ios.nativeProjectDirAbs,
      },
    ),
  );

  const archivePlistContents = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>method</key>
<string>app-store-connect</string>
</dict>
</plist>`;

  const archivePlistPath = join(`${config.ios.nativeProjectDirAbs}`, 'archive.plist');

  writeFileSync(archivePlistPath, archivePlistContents);

  await runTask('Building IPA', async () =>
    runCommand(
      'xcodebuild',
      [
        'archive',
        '-archivePath',
        `${theScheme}.xcarchive`,
        '-exportArchive',
        '-exportOptionsPlist',
        'archive.plist',
        '-exportPath',
        'output',
        '-allowProvisioningUpdates',
        '-configuration',
        buildOptions.configuration,
      ],
      {
        cwd: config.ios.nativeProjectDirAbs,
      },
    ),
  );

  await runTask('Cleaning up', async () => {
    unlinkSync(archivePlistPath);
    rimraf.sync(join(config.ios.nativeProjectDirAbs, `${theScheme}.xcarchive`));
  });

  logSuccess(`Successfully generated an IPA at: ${join(config.ios.nativeProjectDirAbs, 'output')}`);
}
