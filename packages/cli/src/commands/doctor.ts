import { askPlatform, log, logFatal } from '../common';
import { doctorIOS } from '../platforms/ios/doctor';
import { exit } from 'shelljs';


export async function doctorCommand(platform: string) {
  platform = await askPlatform(platform);
  try {
    await doctor(platform);
    log('good job! current setup looks perfect. Everything ready to go! 💪');
    exit(0);
  } catch (e) {
    logFatal(e);
  }
}

export async function doctor(platform: string) {
  if (platform === 'ios') {
    await doctorIOS();
  }
}

