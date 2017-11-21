import { log } from "../utils";
import { ls, cp } from 'shelljs';
import { join } from 'path';

export function copy(args: any[]) {
  const platform = args.shift();
  log('copy', platform);

  const platformFolders = ls(platform);
  const first = platformFolders[0];
  if(!first) {
    return 1;
  }

  const dest = join(platform, first, 'www');
  log('cp', '-R', 'www/*', dest);
  cp('-R', 'www/*', dest);
}
