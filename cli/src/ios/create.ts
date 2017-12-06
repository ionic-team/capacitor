import { checkCocoaPods, checkNoIOSProject} from './common';
import { check, runTask } from '../common';
import { Config } from '../config';
import { cp } from 'shelljs';


export async function createIOS(config: Config) {
  await check(
    config,
    checkCocoaPods,
    checkNoIOSProject
  );

  await runTask(`Creating native xcode project in: ${config.ios.platformDir}`, async () => {
    cp('-R', config.ios.assets.templateDir, config.ios.platformDir);
  });
}
