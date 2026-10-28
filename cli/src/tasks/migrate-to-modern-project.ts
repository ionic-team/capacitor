import { join } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';
import type { BuildSettings } from '../util/xcode';
import { addMultipleBuildSettings } from '../util/xcode';

export async function migrateToModernProject(config: Config): Promise<void> {
  const pbxprojPath = join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');

  const settingsToAdd: BuildSettings = {
    CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS: 'YES',
    CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF: 'YES',
    CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: 'YES',
    STRING_CATALOG_GENERATE_SYMBOLS: 'YES',
  };

  if ((await config.ios.packageManager) === 'SPM') {
    settingsToAdd['ENABLE_USER_SCRIPT_SANDBOXING'] = 'YES';
  }

  try {
    addMultipleBuildSettings(pbxprojPath, settingsToAdd);
  } catch (err: any) {
    logger.warn(
      `Could not update the project ${pbxprojPath} to latest apple recomendations: ${err?.message ?? err}. ` +
        `You can manually do so in Xcode`,
    );
  }
}
