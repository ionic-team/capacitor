import { exit } from 'shelljs';
import { askPlatform, logFatal, runTask } from '../common';
import { openAndroid } from '../platforms/android/open';
import { openIOS } from '../platforms/ios/open';

export async function openCommand(platform: string) {
  platform = await askPlatform(platform, `Please choose a platform to open:`);

  try {
    await open(platform);
    exit(0);

  } catch (e) {
    logFatal(e);
  }
}

export async function open(platform: string) {
  if (platform === 'ios') {
    await runTask('Opening the xcode workspace...', openIOS);

  } else if (platform === 'android') {
    await runTask('Opening the Android project...', openAndroid);

  } else {
    throw `Platform ${platform} is not valid.`;
  }
}
