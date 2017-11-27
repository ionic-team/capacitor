import { checkCocoaPods, checkNoIOSProject, getIOSBaseProject} from './common';
import { check, runTask } from '../../common';
import { cp } from 'shelljs';
import { IOS_PATH } from '../../config';


export async function startIOS() {
  await check(
    checkCocoaPods,
    checkNoIOSProject
  );
  await runTask(`Creating a native xcode project in ${IOS_PATH}`, async () => {
    cp('-R', getIOSBaseProject(), IOS_PATH);
  });
}
