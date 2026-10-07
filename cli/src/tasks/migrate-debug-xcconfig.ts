import { existsSync, readFileSync, remove } from 'fs-extra';
import { join } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';
import { removeInfoPlistDebug } from '../util/spm';
import { removeBaseConfigurationFile } from '../util/xcode';

type DebugXcconfigState = 'absent' | 'stock' | 'customized';

const STOCK_LINE = /^CAPACITOR_DEBUG\s*=\s*true$/;

export async function removeDebugXcconfig(config: Config): Promise<void> {
  if ((await config.ios.packageManager) !== 'SPM') {
    return;
  }

  const xcconfigPath = join(config.ios.platformDirAbs, 'debug.xcconfig');
  const state = classifyDebugXcconfig(xcconfigPath);

  if (state === 'customized') {
    logger.warn(
      `${xcconfigPath} declares build settings besides CAPACITOR_DEBUG, leaving it in place. ` +
        `Remove the CAPACITOR_DEBUG line yourself — Capacitor 9 no longer reads it.`,
    );
  } else if (state === 'stock' && unregisterFromXcodeProject(config)) {
    await remove(xcconfigPath);
    logger.info(`Removed ${xcconfigPath}.`);
  }

  const result = removeInfoPlistDebug(config);
  if (result.status === 'skipped') {
    logger.warn(`CAPACITOR_DEBUG not removed from Info.plist: ${result.reason}`);
  }
}

/**
 * Deleting the file while the Debug build configuration still points at it fails the
 * Xcode build, so the file only goes once the project has been rewritten.
 */
function unregisterFromXcodeProject(config: Config): boolean {
  const pbxprojPath = join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');
  try {
    removeBaseConfigurationFile(pbxprojPath, 'debug.xcconfig');
    return true;
  } catch (err: any) {
    logger.warn(
      `Could not remove the debug.xcconfig reference from ${pbxprojPath}: ${err?.message ?? err}. ` +
        `Remove debug.xcconfig from the Xcode project manually.`,
    );
    return false;
  }
}

function classifyDebugXcconfig(path: string): DebugXcconfigState {
  if (!existsSync(path)) {
    return 'absent';
  }
  const settings = readFileSync(path, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));
  return settings.every((line) => STOCK_LINE.test(line)) ? 'stock' : 'customized';
}

// Exported for tests.
export const __testables = {
  classifyDebugXcconfig,
};
