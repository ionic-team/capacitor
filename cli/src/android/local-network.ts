import { pathExists, readFile, writeFile } from 'fs-extra';
import { homedir } from 'os';
import { join } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';
import { runCommand } from '../util/subprocess';

/**
 * Handles the Android 17 (API 37) `ACCESS_LOCAL_NETWORK` permission for live reload (`cap run --url`).
 *
 * Pages loaded from a local network URL (live reload, `server.url`) fail before any JavaScript runs when the
 * permission isn't granted, so the app can't request it itself. For a live reload run the CLI declares the
 * permission in the app manifest just for the Gradle build, then grants it with `adb` after the install.
 *
 * The declaration the CLI adds is tracked by a marker comment so the revert only removes what the CLI added:
 *
 *   <!-- capacitor:local-network -->
 *   <uses-permission android:name="android.permission.ACCESS_LOCAL_NETWORK" />
 */

const PERMISSION = 'android.permission.ACCESS_LOCAL_NETWORK';
const MARKER = '<!-- capacitor:local-network -->';
const PERMISSION_ELEMENT = `<uses-permission android:name="${PERMISSION}" />`;
const MARKED_BLOCK_REGEX =
  /[ \t]*<!--\s*capacitor:local-network\s*-->[ \t]*\r?\n[ \t]*<uses-permission\b[^>]*\/>[ \t]*\r?\n?/;
const MIN_API_LEVEL = 37;

/**
 * Adds or removes the permission declaration the CLI owns in the app manifest.
 * Returns `true` when the manifest holds a declaration owned by the CLI (added now, or left over from an
 * interrupted build) that the caller should revert, `false` when there was nothing to do, for example because the
 * app already declares the permission itself. A declaration the app owns is never removed.
 */
export async function setAndroidLocalNetworkDeclaration(config: Config, enabled: boolean): Promise<boolean> {
  const manifestPath = join(config.android.srcMainDirAbs, 'AndroidManifest.xml');
  if (!(await pathExists(manifestPath))) {
    return false;
  }

  const manifest = await readFile(manifestPath, 'utf-8');

  if (enabled) {
    // A marked block left behind by an interrupted build is the CLI's own, so the revert after this build removes it.
    if (MARKED_BLOCK_REGEX.test(manifest)) {
      return true;
    }
    if (manifest.includes(PERMISSION)) {
      return false;
    }
    const closing = manifest.lastIndexOf('</manifest>');
    if (closing === -1) {
      logger.warn(`Could not declare the local network permission: no </manifest> found in ${manifestPath}.`);
      return false;
    }
    await writeFile(
      manifestPath,
      `${manifest.slice(0, closing)}    ${MARKER}\n    ${PERMISSION_ELEMENT}\n${manifest.slice(closing)}`,
    );
    return true;
  }

  if (!MARKED_BLOCK_REGEX.test(manifest)) {
    return false;
  }
  await writeFile(manifestPath, manifest.replace(MARKED_BLOCK_REGEX, ''));
  return true;
}

function defaultAndroidSdkDir(): string | undefined {
  switch (process.platform) {
    case 'darwin':
      return join(homedir(), 'Library', 'Android', 'sdk');
    case 'linux':
      return join(homedir(), 'Android', 'sdk');
    case 'win32':
      return join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'Android', 'Sdk');
    default:
      return undefined;
  }
}

/**
 * Finds `adb` the same way native-run finds the Android SDK for the install: `ANDROID_HOME`, then
 * `ANDROID_SDK_ROOT`, then the default SDK location of the platform. Falls back to `adb` on the PATH.
 */
async function resolveAdb(): Promise<string> {
  const sdkRoots = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, defaultAndroidSdkDir()];
  const adbName = process.platform === 'win32' ? 'adb.exe' : 'adb';

  for (const sdkRoot of sdkRoots) {
    if (!sdkRoot) {
      continue;
    }
    const adbPath = join(sdkRoot, 'platform-tools', adbName);
    if (await pathExists(adbPath)) {
      return adbPath;
    }
  }
  return 'adb';
}

/**
 * Grants the permission to the installed app and relaunches it, since the first page load already failed.
 * Does nothing below Android 17, where the permission doesn't exist.
 */
export async function grantAndroidLocalNetworkPermission(config: Config, targetId: string): Promise<void> {
  const adb = await resolveAdb();
  const appId = config.app.appId;

  try {
    const apiLevel = parseInt(
      (await runCommand(adb, ['-s', targetId, 'shell', 'getprop', 'ro.build.version.sdk'])).trim(),
      10,
    );
    if (apiLevel < MIN_API_LEVEL) {
      logger.info(
        `Skipping the local network permission: it only exists on Android 17 (API ${MIN_API_LEVEL}) and later.`,
      );
      return;
    }
    await runCommand(adb, ['-s', targetId, 'shell', 'pm', 'grant', appId, PERMISSION]);
    logger.info(
      `Granted the local network permission to ${appId} for this live reload run. Your app still needs to declare and request it to reach the local network in production.`,
    );
    await runCommand(adb, ['-s', targetId, 'shell', 'am', 'force-stop', appId]);
    await runCommand(adb, [
      '-s',
      targetId,
      'shell',
      'monkey',
      '-p',
      appId,
      '-c',
      'android.intent.category.LAUNCHER',
      '1',
    ]);
  } catch (e: any) {
    logger.warn(`Could not grant the local network permission to ${appId}: ${e}`);
  }
}
