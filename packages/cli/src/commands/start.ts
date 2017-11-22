import { askPlatform, logFatal } from '../common';
import { exit } from 'shelljs';
import { startIOS } from '../platforms/ios/start';
import { prepare } from './prepare';


export async function startCommand(platform: string) {
  platform = await askPlatform(platform);
  try {
    await start(platform);
    await prepare(platform);
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

