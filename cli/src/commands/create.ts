import { askPlatform, logFatal } from '../common';
import { createAndroid } from '../platforms/android/create';
import { createIOS } from '../platforms/ios/create';
import { exit } from 'shelljs';
import { sync } from './sync';


export async function createCommand(platform: string) {
  platform = await askPlatform(platform, `Please choose a platform to create:`);

  try {
    await create(platform);
    await sync(platform);
    exit(0);

  } catch (e) {
    logFatal(e);
  }
}


export async function create(platform: string) {
  if (platform === 'ios') {
    await createIOS();

  } else if (platform === 'android') {
    await createAndroid();

  } else {
    throw `Platform ${platform} is not valid.`;
  }
}

