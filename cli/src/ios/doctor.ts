import { check, checkWebDir } from '../common';
import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logSuccess } from '../log';
import { isInstalled } from '../util/subprocess';

import { checkBundler, checkCocoaPods } from './common';

export async function doctorIOS(config: Config): Promise<void> {
  // DOCTOR ideas for iOS:
  // plugin specific warnings
  // check cocoapods installed
  // check projects exist
  // check content in www === ios/www
  // check CLI versions
  // check plugins versions
  // check native project deps are up-to-date === npm install
  // check if npm install was updated
  // check online datebase of common errors
  // check if www folder is empty (index.html does not exist)
  try {
    await check([() => checkBundler(config) || checkCocoaPods(config), () => checkWebDir(config), checkXcode]);
    logSuccess('iOS looking great! 👌');
  } catch (e: any) {
    fatal(e.stack ?? e);
  }
}

async function checkXcode() {
  if (!(await isInstalled('xcodebuild'))) {
    return `Xcode is not installed`;
  }
  // const matches = output.match(/^Xcode (.*)/);
  // if (matches && matches.length === 2) {
  //   const minVersion = '9.0.0';
  //   const semver = await import('semver');
  //   console.log(matches[1]);
  //   if (semver.gt(minVersion, matches[1])) {
  //     return `Xcode version is too old, ${minVersion} is required`;
  //   }
  // }
  return null;
}
