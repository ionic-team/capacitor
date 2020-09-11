import { relative } from 'path';

import c from '../colors';
import { CheckFunction, copyTemplate, runTask } from '../common';
import { Config } from '../config';

import { checkCocoaPods, checkIOSPackage } from './common';

export const addIOSChecks: CheckFunction[] = [checkIOSPackage, checkCocoaPods];

export async function addIOS(config: Config): Promise<void> {
  const nativeRelDir = relative(config.app.rootDir, config.ios.platformDir);
  await runTask(
    `Adding native Xcode project in ${c.strong(nativeRelDir)}`,
    () => {
      return copyTemplate(
        config.ios.assets.templateDir,
        config.ios.platformDir,
      );
    },
  );
}
