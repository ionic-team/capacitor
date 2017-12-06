import { Config } from '../config';
import { doctorAndroid } from '../android/doctor';
import { doctorIOS } from '../ios/doctor';


export async function doctorCommand(config: Config, selectedPlatform: string) {
  const platforms = config.selectPlatforms(selectedPlatform);

  return Promise.all(platforms.map(platformName => {
    return doctor(config, platformName);
  }));
}


export async function doctor(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await doctorIOS(config);

  } else if (platformName === config.android.name) {
    await doctorAndroid(config);

  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

