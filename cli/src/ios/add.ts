import { strong } from '../colors';
import { copyTemplate, runTask } from '../common';
import type { Config } from '../definitions';

export async function addIOS(config: Config): Promise<void> {
  await runTask(
    `Adding native Xcode project in ${strong(config.ios.platformDir)}`,
    () => {
      return copyTemplate(
        config.ios.assets.templateDir,
        config.ios.platformDirAbs,
      );
    },
  );
}
