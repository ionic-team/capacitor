import { Config } from '../config';
import { createAndroid } from '../android/create';
import { createIOS, createIOSChecks } from '../ios/create';
import { check, checkPackage, checkWebDir, logFatal } from '../common';
import { sync } from './sync';
import { open } from './open';


export async function createCommand(config: Config, selectedPlatformName: string) {
  const platformName = await config.askPlatform(
    selectedPlatformName,
    `Please choose a platform to create:`
  );

  const existingPlatformDir = config.platformDirExists(platformName);
  if (existingPlatformDir) {
    logFatal(`"${platformName}" platform already exists.
    To create a new "${platformName}" platform, please remove "${existingPlatformDir}" and run this command again.
    WARNING! your xcode setup will be completely removed.`);
  }

  try {
    await check(
      config,
      [checkPackage, checkWebDir, ...createChecks(config, platformName)]
    );
    await create(config, platformName);
    await sync(config, platformName);
    await open(config, platformName);

  } catch (e) {
    logFatal(e);
  }
}

export function createChecks(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    return createIOSChecks;
  } else if (platformName === config.android.name) {
    return [];
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

export async function create(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await createIOS(config);
  } else if (platformName === config.android.name) {
    await createAndroid(config);
  }
}

