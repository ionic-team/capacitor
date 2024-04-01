import open from 'open';

import { wait } from '../common';
import type { Config } from '../definitions';
import { checkPackageManager } from '../util/spm';

export async function openIOS(config: Config): Promise<void> {
  if ((await checkPackageManager(config)) == 'SPM') {
    await open(config.ios.nativeXcodeProjDirAbs, { wait: false });
  } else {
    await open(await config.ios.nativeXcodeWorkspaceDirAbs, { wait: false });
  }

  await wait(3000);
}
