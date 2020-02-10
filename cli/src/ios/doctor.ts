import { checkCocoaPods, checkIOSProject } from './common';
import { check, checkNPMVersion, checkWebDir, isInstalled, logFatal, logSuccess } from '../common';
import { Config } from '../config';
import { getPlugins, printPlugins } from '../plugin';


export async function doctorIOS(config: Config) {
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
    await check(
      config,
      [checkCocoaPods, checkIOSProject, checkWebDir, checkNPMVersion, checkXcode]
    );
    const plugins = await getPlugins(config);
    printPlugins(plugins, 'ios');
    logSuccess('iOS looking great! 👌');
  } catch (e) {
    logFatal(e);
  }
}

async function checkXcode() {
  if (!await isInstalled('xcodebuild')) {
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



