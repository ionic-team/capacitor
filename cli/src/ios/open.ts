import open from 'open';

import { wait } from '../common';
import type { Config } from '../definitions';

export async function openIOS(config: Config): Promise<void> {
  await open(await config.ios.nativeXcodeWorkspaceDirAbs, { wait: false });
  await wait(3000);
}
