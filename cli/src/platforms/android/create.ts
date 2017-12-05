import { runCommand, runTask } from '../../common';
import { ANDROID_APP_BASE, ANDROID_PATH } from '../../config';


export async function createAndroid() {
  await runTask(`Creating Android project in ${ANDROID_PATH}`, async () => {
    const npmInstall = `npm install ${ANDROID_APP_BASE} --no-save`;
    return runCommand(npmInstall);
  });
}
