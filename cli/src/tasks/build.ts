import { buildAndroid } from '../android/build';
import { selectPlatforms, promptForPlatform } from '../common';
import type { Config } from '../definitions';
import { XcodeExportMethod } from '../definitions';
import { fatal, isFatal } from '../errors';
import { buildiOS } from '../ios/build';

export interface BuildCommandOptions {
  scheme?: string;
  flavor?: string;
  keystorepath?: string;
  keystorepass?: string;
  keystorealias?: string;
  keystorealiaspass?: string;
  androidreleasetype?: 'AAB' | 'APK';
  signingtype?: 'apksigner' | 'jarsigner';
  configuration: string;
  xcodeTeamId?: string;
  xcodeExportMethod?: XcodeExportMethod;
  xcodeSigningType?: 'automatic' | 'manual';
  xcodeSigningCertificate?: string;
  xcodeProvisioningProfile?: string;
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

  const buildCommandOptions: BuildCommandOptions = {
    scheme: buildOptions.scheme || config.ios.scheme,
    flavor: buildOptions.flavor || config.android.flavor,
    keystorepath: buildOptions.keystorepath || config.android.buildOptions.keystorePath,
    keystorepass: buildOptions.keystorepass || config.android.buildOptions.keystorePassword,
    keystorealias: buildOptions.keystorealias || config.android.buildOptions.keystoreAlias,
    keystorealiaspass: buildOptions.keystorealiaspass || config.android.buildOptions.keystoreAliasPassword,
    androidreleasetype: buildOptions.androidreleasetype || config.android.buildOptions.releaseType || 'AAB',
    signingtype: buildOptions.signingtype || config.android.buildOptions.signingType || 'jarsigner',
    configuration: buildOptions.configuration || 'Release',
    xcodeTeamId: buildOptions.xcodeTeamId || config.ios.buildOptions.teamId,
    xcodeExportMethod:
      buildOptions.xcodeExportMethod || config.ios.buildOptions.exportMethod || XcodeExportMethod.AppStoreConnect,
    xcodeSigningType: buildOptions.xcodeSigningType || config.ios.buildOptions.xcodeSigningStyle || 'automatic',
    xcodeSigningCertificate: buildOptions.xcodeSigningCertificate || config.ios.buildOptions.signingCertificate,
    xcodeProvisioningProfile: buildOptions.xcodeProvisioningProfile || config.ios.buildOptions.provisioningProfile,
  };

  try {
    await build(config, platformName, buildCommandOptions);
  } catch (e) {
    if (!isFatal(e)) {
      fatal((e as any).stack ?? e);
    }
    throw e;
  }
}

export async function build(config: Config, platformName: string, buildOptions: BuildCommandOptions): Promise<void> {
  if (platformName == config.ios.name) {
    await buildiOS(config, buildOptions);
  } else if (platformName === config.android.name) {
    await buildAndroid(config, buildOptions);
  } else if (platformName === config.web.name) {
    throw `Platform "${platformName}" is not available in the build command.`;
  } else {
    throw `Platform "${platformName}" is not valid.`;
  }
}

function createBuildablePlatformFilter(config: Config): (platform: string) => boolean {
  return (platform) => platform === config.ios.name || platform === config.android.name;
}
