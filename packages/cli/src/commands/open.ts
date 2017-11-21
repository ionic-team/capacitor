import { ls, exec } from 'shelljs';
import { join } from 'path';
import { log, logError } from '../utils';

export function open(args: any[]) {
  const platform = args.shift();

  const platformFolders = ls(platform);
  const first = platformFolders[0];
  if(!first) {
    return 1;
  }

  const dest = join(platform, first);

  if (platform == 'ios') {
    log('ls', )
    const proj = ls(dest).filter(f => f.indexOf('.xcodeproj') >= 0)[0];
    if (!proj) {
      logError('open', 'Unable to find Xcode project');
      return 1;
    }
    const fullPath = join(dest, proj);
    log('open', fullPath);
    exec(`open ${fullPath}`);
  }
}
