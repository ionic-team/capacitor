import { checkCocoaPods, checkNoIOSProject} from './common';
import { check, checkPackage, runTask } from '../common';
import { Config } from '../config';
import { cp } from 'shelljs';


export async function createIOS(config: Config) {
  await check(
    config,
    [checkCocoaPods, checkPackage, checkNoIOSProject]
  );

  await runTask(`Creating native xcode project in: ${config.ios.platformDir}`, async () => {
    cp('-R', config.ios.assets.templateDir, config.ios.platformDir);
  });
}
