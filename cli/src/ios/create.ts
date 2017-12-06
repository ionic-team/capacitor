import { checkCocoaPods } from './common';
import { CheckFunction, runTask } from '../common';
import { Config } from '../config';
import { cp } from 'shelljs';

export const createIOSChecks: CheckFunction[] = [checkCocoaPods];

export async function createIOS(config: Config) {
  await runTask(`Creating native xcode project in: ${config.ios.platformDir}`, async () => {
    cp('-R', config.ios.assets.templateDir, config.ios.platformDir);
  });
}
