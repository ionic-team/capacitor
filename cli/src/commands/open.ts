import { exec, exit, ls } from 'shelljs';
import { join } from 'path';
import { askPlatform, logFatal, runTask } from '../common';
import { openIOS } from '../platforms/ios/open';

export async function openCommand(platform: string) {
  platform = await askPlatform(platform);
  try {
    await open(platform);
    exit(0);
  } catch (e) {
    logFatal(e);
  }
}

export async function open(platform: string) {
  if (platform === 'ios') {
    await runTask('Opening the xcode workspace, hold on a sec...', openIOS);
  }
}
