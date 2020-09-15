import { relative } from 'path';

import c from '../colors';
import type { CheckFunction } from '../common';
import { copyTemplate, runTask } from '../common';
import type { Config } from '../config';

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
