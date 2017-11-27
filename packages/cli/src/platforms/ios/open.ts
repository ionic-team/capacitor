import { checkCocoaPods, checkIOSProject, findXcodePath } from './common';
import { check, wait } from '../../common';
import { exit } from 'shelljs';
import opn = require('opn');


export async function openIOS() {
  const xcodeProject = findXcodePath();
  if (xcodeProject) {
    await opn(xcodeProject, { wait: false });
    await wait(3000);
  } else {
    throw 'Xcode workspace does not exist. Run "avocado start ios" to bootstrap a native ios project.';
  }
}
