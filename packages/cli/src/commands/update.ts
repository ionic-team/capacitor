import { updateIOS } from '../platforms/ios/update';
import { log, logError, askMode } from '../common';
import { exit } from 'shelljs';


export async function updateCommand(mode: string, options: any) {
  const finalMode = await askMode(mode);

  // try {
  //   await runCommand('npm install');
  // } catch (e) {
  //   logError('Looks like npm install failed, make sure package.json is valid and points to valid dependencies.');
  //   logError(e);
  //   exit(-1);
  // }

  try {
    const needsUpdate = !!options.force;
    await update(finalMode, needsUpdate);
    exit(0);
  } catch (e) {
    logError(e);
    exit(-1);
  }
}

export async function update(mode: string, needsUpdate: boolean) {
  if (mode === 'ios') {
    await updateIOS(needsUpdate)
  } else if (mode === 'android') {
    // await updateAndroid();
  } else {
    throw `Platform ${mode} is not valid. Try with iOS or android`;
  }
}
