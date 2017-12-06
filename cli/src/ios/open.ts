import { Config } from '../config';
import { findXcodePath } from './common';
import { wait } from '../common';


export async function openIOS(config: Config) {
  const xcodeProject = findXcodePath(config);

  if (xcodeProject) {
    const opn = require('opn');
    await opn(xcodeProject, { wait: false });
    await wait(3000);

  } else {
    throw 'Xcode workspace does not exist. Run "avocado create ios" to bootstrap a native ios project.';
  }
}
