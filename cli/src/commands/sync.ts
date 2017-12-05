import { getPlatforms } from '../common';
import { update } from './update';
import { copy } from './copy';


export async function syncCommand(platform: string) {
  const platforms = getPlatforms(platform);

  return Promise.all(platforms.map(sync));
}


export async function sync(platform: string) {
  await update(platform, false);
  await copy(platform);
}
