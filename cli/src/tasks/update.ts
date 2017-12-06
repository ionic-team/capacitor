import { Config } from '../config';
import { updateAndroid } from '../android/update';
import { updateIOS } from '../ios/update';


export async function updateCommand(config: Config, selectedPlatformName: string) {
  const platforms = config.selectPlatforms(selectedPlatformName);

  return Promise.all(platforms.map(platformName => {
    return update(config, platformName, true);
  }));
}


export async function update(config: Config, platformName: string, needsUpdate: boolean) {
  if (platformName === config.ios.name) {
    await updateIOS(config, needsUpdate);

  } else if (platformName === config.android.name) {
    await updateAndroid(config, needsUpdate);

  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}
