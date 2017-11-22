import { updateIOS } from '../platforms/ios/update';
import { log, logError, askPlatform } from '../common';
import { exit } from 'shelljs';


export async function updateCommand(platform: string) {
  const finalPlatform = await askPlatform(platform);

  try {
    await update(finalPlatform, true);
    exit(0);
  } catch (e) {
    logError(e);
    exit(-1);
  }
}

export async function update(platform: string, needsUpdate: boolean) {
  if (platform === 'ios') {
    await updateIOS(needsUpdate)
  } else if (platform === 'android') {
    // await updateAndroid();
  } else {
    throw `Platform ${platform} is not valid. Try with iOS or android`;
  }
}
