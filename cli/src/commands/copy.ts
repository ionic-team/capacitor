import { askPlatform, getRootPath, logFatal, runTask } from '../common';
import { cp, exit, ls } from 'shelljs';
import { join } from 'path';
import { ANDROID_PATH, IOS_PATH } from '../config';


export async function copyCommand(platform: string) {
  platform = await askPlatform(platform);
  try {
    await copy(platform);
    exit(0);
  } catch (e) {
    logFatal(e);
  }
}

export async function copy(platform: string) {
  await runTask('Copying www -> ios/www', async () => {
    const modeRoot = getRootPath(platform);
    const dest = platform + '/';
    cp('-R', 'www', dest);
  });
}
