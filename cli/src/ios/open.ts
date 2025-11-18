import open from 'open';

import { wait } from '../common.js';
import type { Config } from '../definitions.js';
import { checkPackageManager } from '../util/spm.js';

export async function openIOS(config: Config): Promise<void> {
  if ((await checkPackageManager(config)) == 'SPM') {
    await open(config.ios.nativeXcodeProjDirAbs, { wait: false });
  } else {
    await open(await config.ios.nativeXcodeWorkspaceDirAbs, { wait: false });
  }

  await wait(3000);
}
