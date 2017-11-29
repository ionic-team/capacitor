import { askPlatform, logFatal } from '../common';
import { exit } from 'shelljs';
import { createIOS } from '../platforms/ios/create';
import { sync } from './sync';


export async function createCommand(platform: string) {
  platform = await askPlatform(platform);
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
    // android
  }
}

