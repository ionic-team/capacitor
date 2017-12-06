import { Config } from '../config';
import { wait } from '../common';


export async function openAndroid(config: Config) {
  config;
  const androidProject = 'TODO';

  if (androidProject) {
    const opn = require('opn');
    await opn(androidProject, { wait: false });
    await wait(3000);

  } else {
    throw 'Android project does not exist. Run "avocado create android" to bootstrap a native android project.';
  }
}
