import { addArrayOfBuildSettings, BuildSettings } from '../util/xcode'
import { join } from 'path';
import type { Config } from '../definitions';

const settingsToAdd: BuildSettings = {
    "CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS": true,
    "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF": true,
    "CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER": true,
    "ENABLE_USER_SCRIPT_SANDBOXING": true,
    "STRING_CATALOG_GENERATE_SYMBOLS": true
}

export async function migrateToModernProject(config: Config): Promise<void> {
  const pbxprojPath = join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');
  addArrayOfBuildSettings(pbxprojPath, settingsToAdd)
}
