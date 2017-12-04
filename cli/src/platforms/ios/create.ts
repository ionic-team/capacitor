import { checkCocoaPods, checkNoIOSProject} from './common';
import { check, getAssetsPath, runTask } from '../../common';
import { cp } from 'shelljs';
import { IOS_PATH } from '../../config';


export async function createIOS() {
  await check(
    checkCocoaPods,
    checkNoIOSProject
  );
  await runTask(`Creating a native xcode project in ${IOS_PATH}`, async () => {
    cp('-R', getAssetsPath('xcode-base'), IOS_PATH);
  });
}
