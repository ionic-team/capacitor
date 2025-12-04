import c from '../colors.js';
import { runTask } from '../common.js';
import type { Config } from '../definitions.js';
import { extractTemplate } from '../util/template.js';

export async function addIOS(config: Config): Promise<void> {
  await runTask(`Adding native Xcode project in ${c.strong(config.ios.platformDir)}`, () => {
    return extractTemplate(config.cli.assets.ios.platformTemplateArchiveAbs, config.ios.platformDirAbs);
  });
}
