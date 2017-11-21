import { log, askMode } from '../utils/common';
import { ls, cp } from 'shelljs';
import { join } from 'path';

export async function copy(mode: string) {
  const finalMode = await askMode(mode);
  // const platformFolders = ls(platform);
  // const first = platformFolders[0];
  // if(!first) {
  //   return 1;
  // }

  // const dest = join(platform, first, 'www');
  // log('cp', '-R', 'www/*', dest);
  // cp('-R', 'www/*', dest);
}
