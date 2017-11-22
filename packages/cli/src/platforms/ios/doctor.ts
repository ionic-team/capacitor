import { checkCocoaPods, checkIOSProject } from './common';
import { check } from '../../common';


export async function doctorIOS() {
  // DOCTOR ideas for iOS:
  // plugin specific warnings
  // check cocoapods installed
  // check xcode + git installed
  // check xcode version (we might need to ask them to upgrade)
  // check projects exist
  // check content in www === ios/www
  // check CLI versions
  // check plugins versions
  // check native project deps are up-to-date === npm install
  // check if npm install was updated
  // check online datebase of common errors
  // check if www folder is empty (index.html does not exist)
  await check(
    checkCocoaPods,
    checkIOSProject,
  );
}
