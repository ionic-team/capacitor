import { getPlatforms } from '../common';
import { updateAndroid } from '../platforms/android/update';
import { updateIOS } from '../platforms/ios/update';


export async function updateCommand(platform: string) {
  const platforms = getPlatforms(platform);

  return Promise.all(platforms.map(platform => {
    return update(platform, true);
  }));
}


export async function update(platform: string, needsUpdate: boolean) {
  if (platform === 'ios') {
    await updateIOS(needsUpdate);

  } else if (platform === 'android') {
    await updateAndroid(needsUpdate);

  } else {
    throw `Platform ${platform} is not valid.`;
  }
}
