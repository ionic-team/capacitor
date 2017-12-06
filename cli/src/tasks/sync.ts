import { Config } from '../config';
import { copy } from './copy';
import { update, updateChecks } from './update';
import { check, checkPackage, checkWebDir, logFatal } from '../common';


export async function syncCommand(config: Config, selectedPlatform: string) {
  const platforms = config.selectPlatforms(selectedPlatform);

  try {
    await check(config, [checkPackage, checkWebDir, ...updateChecks(config, platforms)]);
    await Promise.all(platforms.map(platformName => {
      return sync(config, platformName);
    }));
  } catch (e)  {
    logFatal(e);
  }
}

export async function sync(config: Config, platformName: string) {
  await update(config, platformName, false);
  await copy(config, platformName);
}
