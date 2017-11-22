import { checkCocoaPods, checkNoIOSProject, getIOSBaseProject} from './common';
import { check, log } from '../../common';
import { cp } from 'shelljs';
import { IOS_PATH } from '../../config';


export async function startIOS() {
  await check(
    checkCocoaPods,
    checkNoIOSProject
  );

  log(`creating a native xcode project in ${IOS_PATH}`);
  cp('-R', getIOSBaseProject(), IOS_PATH);
}
