import { Config } from '../config';
import { copy } from './copy';
import { update, updateChecks } from './update';
import { add, checkPackage, checkWebDir, logFatal, logInfo } from '../common';


export async function syncCommand(config: Config, selectedPlatform: string) {
  const platforms = config.selectPlatforms(selectedPlatform);
  if (platforms.length === 0) {
    logInfo(`There are no platforms to sync yet. Create one with "capacitor create".`);
    return;
  }

  await add(config, [checkPackage, checkWebDir, ...updateChecks(config, platforms)]);
  await Promise.all(platforms.map(platformName => {
    return sync(config, platformName);
  }));
}

export async function sync(config: Config, platformName: string) {
  await update(config, platformName, false);
  await copy(config, platformName);
}
