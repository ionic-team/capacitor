import { checkCocoaPods } from './common';
import { CheckFunction, copyTemplate, resolveNode, runCommand, runTask, TaskInfoProvider } from '../common';
import { Config } from '../config';

export const addIOSChecks: CheckFunction[] = [checkCocoaPods];

export async function addIOS(config: Config) {
  await runTask(`Installing iOS dependencies`, async (info: TaskInfoProvider) => {
    if (resolveNode(config, '@capacitor/ios')) {
      info('Skipping: already installed');
      return;
    }

    return runCommand(`cd "${config.app.rootDir}" && npm install --save @capacitor/ios`);
  });
  await runTask(`Adding native xcode project in: ${config.ios.platformDir}`, () => {
    return copyTemplate(config.ios.assets.templateDir, config.ios.platformDir);
  });
}
