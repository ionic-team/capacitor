import { log, askMode } from '../common';
import { ls, cp } from 'shelljs';
import { join } from 'path';
import { IOS_PATH, ANDROID_PATH } from '../config';

function getRootPath(mode: string) {
  switch (mode) {
    case 'ios': return IOS_PATH;
    case 'android': return ANDROID_PATH;
  }
  throw 'unknown mode' + mode;
}

export async function copyCommand(mode: string) {
  const finalMode = await askMode(mode);
  copy(finalMode);
}


export async function copy(mode: string) {
  log('copying www folder')
  const modeRoot = getRootPath(mode);
  const dest = mode + '/';
  cp('-R', 'www', dest);
}