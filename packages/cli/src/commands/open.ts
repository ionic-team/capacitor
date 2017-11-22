import { ls, exec, exit } from 'shelljs';
import { join } from 'path';
import { log, logError, askPlatform } from '../common';
import { findXcodePath } from '../platforms/ios/common';
const opn = require('opn');

export async function openCommand(platform: string) {
  const finalMode = await askPlatform(platform);
  try {
    open(finalMode);
    exit(0);
  } catch (e) {
    logError(e);
    exit(-1);
  }
}

export function open(platform: string) {
  if (platform === 'ios') {
    log('Opening your xcode workspace, hold on a sec...');
    const xcodeProject = findXcodePath();
    if (xcodeProject) {
      opn(xcodeProject);
      exit(0);
    } else {
      throw 'Xcode workspace does not exist. Run "avocado start ios" to bootstrap a native ios project.';
    }
  }
}
