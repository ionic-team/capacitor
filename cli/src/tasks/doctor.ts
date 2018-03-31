import { Config } from '../config';
import { log, runCommand, runTask } from '../common';
import { doctorAndroid } from '../android/doctor';
import { doctorIOS } from '../ios/doctor';
import { existsAsync, readFileAsync } from '../util/fs';
import { emoji as _e } from '../util/emoji';

import { join } from 'path';

import chalk from 'chalk';

export async function doctorCommand(config: Config, selectedPlatform: string) {
  log(`${_e('💊', '')}   ${chalk.bold('Capacitor Doctor')}  ${_e('💊', '')} \n`)

  await doctorCore(config);

  const platforms = config.selectPlatforms(selectedPlatform);
  return Promise.all(platforms.map(platformName => {
    return doctor(config, platformName);
  }));
}

export async function doctorCore(config: Config) {
  let cliVersion = await runCommand(`npm info @capacitor/cli version`);
  let coreVersion = await runCommand(`npm info @capacitor/cli version`);
  let androidVersion = await runCommand(`npm info @capacitor/ios version`);
  let iosVersion = await runCommand(`npm info @capacitor/ios version`);

  log(`${chalk.bold.blue('Dependencies:')}\n`);
  log(`  ${chalk.bold('@capacitor/cli:')}`, cliVersion);
  log(`  ${chalk.bold('@capacitor/core:')}`, coreVersion);
  log(`  ${chalk.bold('@capacitor/android:')}`, androidVersion);
  log(`  ${chalk.bold('@capacitor/ios:')}`, iosVersion);

  // Get the version of our pod installed
  const podLockPath = join(config.app.rootDir, 'ios/App/Podfile.lock');
  if (await existsAsync(podLockPath)) {
    const podLock = await readFileAsync(podLockPath, 'utf8');
    const capacitorDepRegex = /Capacitor \(([^)]+)\)/g;
    const match = capacitorDepRegex.exec(podLock);
    const version = match && match[1];
    log(`  ${chalk.bold('Capacitor iOS:')}`, version || 'not installed');
  }

  // Get the version of our Android library installed
  const buildGradlePath = join(config.app.rootDir, 'android/app/build.gradle');
  if (await existsAsync(buildGradlePath)) {
    const buildGradle = await readFileAsync(buildGradlePath, 'utf8');
    const capacitorDepRegex = /implementation 'ionic-team:capacitor-android:([^']+)/g;
    const match = capacitorDepRegex.exec(buildGradle);
    const version = match && match[1];
    log(`  ${chalk.bold('Capacitor Android:')}`, version || 'not installed');
  }

  log('');
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

