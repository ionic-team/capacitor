import { Config } from '../config';
import { copyAndroid } from '../android/copy';
import { copyIOS } from '../ios/copy';
import { check, checkWebDir, logFatal, logInfo } from '../common';


export async function copyCommand(config: Config, selectedPlatformName: string) {
  const platforms = config.selectPlatforms(selectedPlatformName);
  if (platforms.length === 0) {
    logInfo(`There are not platforms to copy yet. Create one with "avocado create".`);
    return;
  }
  try {
    await check(config, [checkWebDir]);
    await Promise.all(platforms.map(platformName => {
      return copy(config, platformName);
    }));
  } catch (e) {
    logFatal(e);
  }
}

export async function copy(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await copyIOS(config);

  } else if (platformName === config.android.name) {
    await copyAndroid(config);

  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}
