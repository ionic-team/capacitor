import { Config } from '../config';
import { log, readJSON, resolveNode, resolveNodeFrom, runCommand } from '../common';
import { doctorAndroid } from '../android/doctor';
import { doctorElectron } from '../electron/doctor';
import { doctorIOS } from '../ios/doctor';
import { emoji as _e } from '../util/emoji';

import { join } from 'path';

import chalk from 'chalk';

export async function doctorCommand(config: Config, selectedPlatform: string) {
  log(`${_e('💊', '')}   ${chalk.bold('Capacitor Doctor')}  ${_e('💊', '')} \n`);

  await doctorCore(config);

  const platforms = config.selectPlatforms(selectedPlatform);
  return Promise.all(platforms.map(platformName => {
    return doctor(config, platformName);
  }));
}

export async function doctorCore(config: Config) {
  let cliVersion = await runCommand(`npm info @capacitor/cli version`);
  let coreVersion = await runCommand(`npm info @capacitor/core version`);
  let androidVersion = await runCommand(`npm info @capacitor/android version`);
  let electronVersion = await runCommand(`npm info @capacitor/android version`);
  let iosVersion = await runCommand(`npm info @capacitor/ios version`);

  log(`${chalk.bold.blue('Latest Dependencies:')}\n`);
  log(`  ${chalk.bold('@capacitor/cli:')}`, cliVersion);
  log(`  ${chalk.bold('@capacitor/core:')}`, coreVersion);
  log(`  ${chalk.bold('@capacitor/android:')}`, androidVersion);
  log(`  ${chalk.bold('@capacitor/electron:')}`, electronVersion);
  log(`  ${chalk.bold('@capacitor/ios:')}`, iosVersion);

  log(`${chalk.bold.blue('Installed Dependencies:')}\n`);

  await printInstalledPackages(config);

  log('');
}

async function printInstalledPackages(config: Config) {
  const packageNames = ['@capacitor/cli', '@capacitor/core', '@capacitor/android', '@capacitor/ios'];
  await Promise.all(packageNames.map(async packageName => {
    const packagePath = resolveNode(config, packageName, 'package.json');
    printPackageVersion(packageName, packagePath);
  }));
  const packagePath = resolveNodeFrom(config.electron.platformDir, '@capacitor/electron');
  printPackageVersion('@capacitor/electron', packagePath ? join(packagePath, 'package.json') : packagePath);
}

async function printPackageVersion(packageName: string, packagePath: string | null) {
  let version;
  if (packagePath) {
    version = (await readJSON(packagePath)).version;
  }
  log(`  ${chalk.bold(packageName)}`, version || 'not installed');
  log('');
}

export async function doctor(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await doctorIOS(config);
  } else if (platformName === config.android.name) {
    await doctorAndroid(config);
  } else if (platformName === config.electron.name) {
    await doctorElectron(config);
  } else if (platformName === config.web.name) {
    return Promise.resolve();
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

