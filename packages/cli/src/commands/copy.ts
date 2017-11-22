import { askPlatform, getRootPath, log, logFatal } from '../common';
import { cp, exit, ls } from 'shelljs';
import { join } from 'path';
import { ANDROID_PATH, IOS_PATH } from '../config';


export async function copyCommand(platform: string) {
  platform = await askPlatform(platform);
  try {
    copy(platform);
    exit(0);
  } catch (e) {
    logFatal(e);
  }
}

export async function copy(platform: string) {
  const modeRoot = getRootPath(platform);
  const dest = platform + '/';
  log(`copying www -> ${dest}www`);
  cp('-R', 'www', dest);
}
