import { Config } from '../config';

export async function createCommand (_config: Config, name: string, identifier: string) {
  console.log('Creating avocado project: Name:', name, 'Identifier:', identifier);
  /*
  const existingProjectDir = 
  if (existingPlatformDir) {
    logFatal(`"${platformName}" platform already exists.
    To add a new "${platformName}" platform, please remove "${existingPlatformDir}" and run this command again.
    WARNING! your xcode setup will be completely removed.`);
  }
  */

  /*
  try {
    await create(
      config,
      [checkPackage, ...createChecks(config, platformName)]
    );
    await generateAvocadoConfig(config);
    await add(config, [checkWebDir]);
    await create(config, platformName);
    await sync(config, platformName);
    await open(config, platformName);

  } catch (e) {
    logFatal(e);
  }
  */
}

