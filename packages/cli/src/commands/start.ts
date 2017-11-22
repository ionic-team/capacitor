import { askPlatform, logFatal } from '../common';
import { exit } from 'shelljs';
import { startIOS } from '../platforms/ios/start';
import { prepare } from './prepare';


export async function startCommand(platform: string) {
  const finalPlatform = await askPlatform(platform);
  try {
    await start(finalPlatform);
    await prepare(finalPlatform);
    exit(0);
  } catch (e) {
    logFatal(e);
  }
}

export async function start(platform: string) {
  if (platform === 'ios') {
    await startIOS();
  } else if (platform === 'android') {
    // android
  }
}

