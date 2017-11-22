import { log, askPlatform, getRootPath } from '../common';
import { ls, cp } from 'shelljs';
import { join } from 'path';
import { IOS_PATH, ANDROID_PATH } from '../config';


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
