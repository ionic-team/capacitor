import { getPlatforms } from '../common';
import { doctorAndroid } from '../platforms/android/doctor';
import { doctorIOS } from '../platforms/ios/doctor';


export async function doctorCommand(platform: string) {
  const platforms = getPlatforms(platform);

  return Promise.all(platforms.map(doctor));
}

export async function doctor(platform: string) {
  if (platform === 'ios') {
    await doctorIOS();

  } else if (platform === 'android') {
    await doctorAndroid();

  } else {
    throw `Platform ${platform} is not valid.`;
  }
}

