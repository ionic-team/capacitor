import { checkCocoaPods, checkIOSProject } from './common';
import { check } from '../../common';


export async function doctorIOS() {
  // DOCTOR ideas for iOS:
  // check cocoapods installed
  // check xcode + git installed
  // check projects exist
  // check content in www === ios/www
  // check CLI versions
  // check plugins versions
  // check xcode project is up-to-date === npm install
  // check if npm install was updated
  // check xcode
  // check online datebase of plugins
  // check if www folder is empty
  await check(
    checkCocoaPods,
    checkIOSProject,
  );
}
