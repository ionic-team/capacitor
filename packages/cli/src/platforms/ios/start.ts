import { isIOSAvailable, getIOSBaseProject } from "./common";
import { log } from "../../common";
import { cp } from "shelljs";
import { IOS_PATH } from "../../config";


export async function startIOS() {
  if (await isIOSAvailable()) {
    throw 'An iOS project already exist';
  }
  log(`creating a native xcode project in ${IOS_PATH}`)
  cp('-R', getIOSBaseProject(), IOS_PATH);
}