import { Config } from '../config';
import { copy } from './copy';
import { update } from './update';


export async function syncCommand(config: Config, selectedPlatform: string) {
  const platforms = config.selectPlatforms(selectedPlatform);

  return Promise.all(platforms.map(platformName => {
    return sync(config, platformName);
  }));
}


export async function sync(config: Config, platformName: string) {
  await update(config, platformName, false);
  await copy(config, platformName);
}
