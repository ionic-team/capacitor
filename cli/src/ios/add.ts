import { relative } from 'path';

import c from '../colors';
import { checkCocoaPods, checkIOSPackage } from './common';
import { CheckFunction, copyTemplate, runTask } from '../common';
import { Config } from '../config';

export const addIOSChecks: CheckFunction[] = [checkIOSPackage, checkCocoaPods];

export async function addIOS(config: Config) {
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
