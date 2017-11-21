import { ls, exec } from 'shelljs';
import { join } from 'path';
import { log, logError } from '../utils/common';

export function open(files: any[]) {
  const platform = files.shift();

  console.log(files);
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
