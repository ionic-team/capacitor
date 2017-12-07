import { checkCocoaPods } from './common';
import { CheckFunction, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';

export const createIOSChecks: CheckFunction[] = [checkCocoaPods];

export async function createIOS(config: Config) {
  await runTask(`Creating native xcode project in: ${config.ios.platformDir}`, () => {
    return copy(config.ios.assets.templateDir, config.ios.platformDir);
  });
}
