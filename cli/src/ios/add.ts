import { checkCocoaPods, checkIOSPackage } from './common';
import { CheckFunction, copyTemplate, runTask } from '../common';
import { Config } from '../config';

export const addIOSChecks: CheckFunction[] = [checkIOSPackage, checkCocoaPods];

export async function addIOS(config: Config) {
  await runTask(
    `Adding native xcode project in: ${config.ios.platformDir}`,
    () => {
      return copyTemplate(
        config.ios.assets.templateDir,
        config.ios.platformDir,
      );
    },
  );
}
