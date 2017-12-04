import { askPlatform, logFatal } from '../common';
import { update } from './update';
import { copy } from './copy';
import { exit } from 'shelljs';
import { open } from './open';


export async function syncCommand(platform: string) {
  platform = await askPlatform(platform);
  try {
    await sync(platform);
    exit(0);
  } catch (e) {
    logFatal(e);
  }
}

export async function sync(platform: string) {
  await update(platform, false);
  await copy(platform);
  await open(platform);
}
