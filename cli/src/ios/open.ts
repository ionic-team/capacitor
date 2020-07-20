import open from 'open';
import { Config } from '../config';
import { findXcodePath } from './common';
import { wait } from '../common';

export async function openIOS(config: Config) {
  const xcodeProject = await findXcodePath(config);

  if (xcodeProject) {
    await open(xcodeProject, { wait: false });
    await wait(3000);
  } else {
    throw new Error(
      'Xcode workspace does not exist. ' +
        'Run "capacitor add ios" to bootstrap a native ios project.',
    );
  }
}
