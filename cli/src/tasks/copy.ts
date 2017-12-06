import { Config } from '../config';
import { copyAndroid } from '../android/copy';
import { copyIOS } from '../ios/copy';
import { existsAsync } from '../common';


export async function copyCommand(config: Config, selectedPlatformName: string) {
  const platforms = config.selectPlatforms(selectedPlatformName);

  return Promise.all(platforms.map(platformName => {
    return copy(config, platformName);
  }));
}


export async function copy(config: Config, platformName: string) {
  const wwwExists = await existsAsync(config.app.webDir);
  if (!wwwExists) {
    return Promise.resolve();
  }

  if (platformName === config.ios.name) {
    await copyIOS(config);

  } else if (platformName === config.android.name) {
    await copyAndroid(config);

  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}
