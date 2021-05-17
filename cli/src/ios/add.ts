import c from '../colors';
import { runTask } from '../common';
import { extractTemplate } from '../util/template';

import type { Config } from '../definitions';

export async function addIOS(config: Config): Promise<void> {
  await runTask(
    `Adding native Xcode project in ${c.strong(config.ios.platformDir)}`,
    () => {
      return extractTemplate(
        config.cli.assets.ios.platformTemplateArchiveAbs,
        config.ios.platformDirAbs,
      );
    },
  );
}
