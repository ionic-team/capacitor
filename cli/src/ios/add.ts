import { checkCocoaPods } from './common';
import { CheckFunction, runCommand, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';

export const addIOSChecks: CheckFunction[] = [checkCocoaPods];

export async function addIOS(config: Config) {
  await runCommand(`npm install @capacitor/ios`);
  await runTask(`Adding native xcode project in: ${config.ios.platformDir}`, () => {
    return copy(config.ios.assets.templateDir, config.ios.platformDir);
  });
}
