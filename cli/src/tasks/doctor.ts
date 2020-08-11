import { Config } from '../config';
import { log, readJSON, resolveNode } from '../common';
import { doctorAndroid } from '../android/doctor';
import { doctorIOS } from '../ios/doctor';
import { emoji as _e } from '../util/emoji';

import chalk from 'chalk';

export async function doctorCommand(
  config: Config,
  selectedPlatform: string,
): Promise<void> {
  log(
    `${_e('💊', '')}   ${chalk.bold('Capacitor Doctor')}  ${_e('💊', '')} \n`,
  );

  await doctorCore(config);

  const platforms = config.selectPlatforms(selectedPlatform);
  await Promise.all(
    platforms.map(platformName => {
      return doctor(config, platformName);
    }),
  );
}

export async function doctorCore(config: Config) {
  log(`${chalk.bold.blue('Installed Dependencies:')}\n`);

  await printInstalledPackages(config);

  log('');
}

async function printInstalledPackages(config: Config) {
  const packageNames = [
    '@capacitor/cli',
    '@capacitor/core',
    '@capacitor/android',
    '@capacitor/ios',
  ];
  await Promise.all(
    packageNames.map(async packageName => {
      const packagePath = resolveNode(config, packageName, 'package.json');
      await printPackageVersion(packageName, packagePath);
    }),
  );
}

async function printPackageVersion(
  packageName: string,
  packagePath: string | null,
) {
  let version;
  if (packagePath) {
    version = (await readJSON(packagePath)).version;
  }
  log(`  ${chalk.bold(packageName)}`, version || 'not installed');
}

export async function doctor(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await doctorIOS(config);
  } else if (platformName === config.android.name) {
    await doctorAndroid(config);
  } else if (platformName === config.web.name) {
    return Promise.resolve();
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}
