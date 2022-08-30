import { buildAndroid } from '../android/build';
import c from '../colors';
import { selectPlatforms, promptForPlatform } from '../common';
import type { Config } from '../definitions';
import { fatal, isFatal } from '../errors';

export interface BuildCommandOptions {
  keystorepath: string;
  keystorepass: string;
  keystorealias: string;
  keystorealiaspass: string;
  androidreleasetype: string;
}

export async function buildCommand(
  config: Config,
  selectedPlatformName: string,
  buildOptions: BuildCommandOptions,
): Promise<void> {
  const platforms = await selectPlatforms(config, selectedPlatformName);
  let platformName: string;
  if (platforms.length === 1) {
    platformName = platforms[0];
  } else {
    platformName = await promptForPlatform(
      platforms.filter(createBuildablePlatformFilter(config)),
      `Please choose a platform to build for:`,
    );
  }

  try {
    await build(config, platformName, buildOptions);
  } catch (e) {
    if (!isFatal(e)) {
      fatal((e as any).stack ?? e);
    }
    throw e;
  }
}

export async function build(
  config: Config,
  platformName: string,
  buildOptions: BuildCommandOptions,
): Promise<void> {
  if (platformName == config.ios.name) {
    throw `Platform "${platformName}" is not available in the build command.`;
  } else if (platformName === config.android.name) {
    await buildAndroid(config, buildOptions);
  } else if (platformName === config.web.name) {
    throw `Platform "${platformName}" is not available in the build command.`;
  } else {
    throw `Platform "${platformName}" is not valid.`;
  }
}

function createBuildablePlatformFilter(
  config: Config,
): (platform: string) => boolean {
  return platform =>
    platform === config.ios.name || platform === config.android.name;
}
