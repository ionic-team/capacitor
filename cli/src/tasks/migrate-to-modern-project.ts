import { addArrayOfBuildSettings, BuildSettings } from '../util/xcode'
import { join } from 'path';
import type { Config } from '../definitions';

const settingsToAdd: BuildSettings = {
    "CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS": "YES",
    "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF": "YES",
    "CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER": "YES",
    "ENABLE_USER_SCRIPT_SANDBOXING": "YES",
    "STRING_CATALOG_GENERATE_SYMBOLS": "YES"
}

export async function migrateToModernProject(config: Config): Promise<void> {
  const pbxprojPath = join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');
  addArrayOfBuildSettings(pbxprojPath, settingsToAdd)
}
