import { getPlatforms } from '../common';
import { copyAndroid } from '../platforms/android/copy';
import { copyIOS } from '../platforms/ios/copy';


export async function copyCommand(platform: string) {
  const platforms = getPlatforms(platform);

  return Promise.all(platforms.map(copy));
}


export async function copy(platform: string) {
  if (platform === 'ios') {
    await copyIOS();

  } else if (platform === 'android') {
    await copyAndroid();

  } else {
    throw `Platform ${platform} is not valid.`;
  }
}
