import open from 'open';

import c from '../colors';
import { wait, logFatal } from '../common';
import type { Config } from '../definitions';

import { findXcodePath } from './common';

export async function openIOS(config: Config): Promise<void> {
  const xcodeProject = await findXcodePath(config);

  if (!xcodeProject) {
    logFatal(
      'Xcode workspace does not exist.\n' +
        `Run ${c.input('npx cap add ios')} to bootstrap a new iOS project.`,
    );
  }

  await open(xcodeProject, { wait: false });
  await wait(3000);
}
