import { askPlatform, getRootPath, log } from '../common';
import { cp, ls } from 'shelljs';
import { join } from 'path';
import { ANDROID_PATH, IOS_PATH } from '../config';


export async function copyCommand(mode: string) {
  const finalPlatform = await askPlatform(mode);
  copy(finalPlatform);
}

export async function copy(platform: string) {
  const modeRoot = getRootPath(platform);
  const dest = platform + '/';
  log(`copying www -> ${dest}www`);
  cp('-R', 'www', dest);
}
