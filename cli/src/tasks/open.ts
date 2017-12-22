import { Config } from '../config';
import { logFatal, logInfo, runTask } from '../common';
import { openAndroid } from '../android/open';
import { openIOS } from '../ios/open';


export async function openCommand(config: Config, selectedPlatform: string) {
  const platforms = config.selectPlatforms(selectedPlatform);
  let platformName: string;
  if (platforms.length === 0) {
    logInfo(`There are no platforms to open yet. Create one with "avocado create".`);
    return;
  } else if (platforms.length === 1) {
    platformName = platforms[0];
  } else {
    platformName = await config.askPlatform('', `Please choose a platform to open:`);
  }

  try {
    await open(config, platformName);

  } catch (e) {
    logFatal(e);
  }
}


export async function open(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await runTask('Opening the xcode workspace...', () => {
      return openIOS(config);
    });

  } else if (platformName === config.android.name) {
    return openAndroid(config);

  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}
