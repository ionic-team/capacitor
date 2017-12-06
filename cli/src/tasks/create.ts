import { Config } from '../config';
import { createAndroid } from '../android/create';
import { createIOS } from '../ios/create';
import { logError, logFatal } from '../common';
import { sync } from './sync';
import { open } from './open';


export async function createCommand(config: Config, selectedPlatformName: string) {
  const platformName = await config.askPlatform(
    selectedPlatformName,
    `Please choose a platform to create:`
  );

  try {
    await create(config, platformName);
    await sync(config, platformName);
    await open(config, platformName);

  } catch (e) {
    logFatal(e);
  }
}


export async function create(config: Config, platformName: string) {
  const existingPlatformDir = config.platformDirExists(platformName);
  if (existingPlatformDir) {
    logError(`"${platformName}" platform already exists.
    To create a new "${platformName}" platform, please remove "${existingPlatformDir}" and run this command again.
    WARNING! your xcode setup will be completely removed.`);
    process.exit(0);
  }

  if (platformName === config.ios.name) {
    await createIOS(config);

  } else if (platformName === config.android.name) {
    await createAndroid(config);

  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

