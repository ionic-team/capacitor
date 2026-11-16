import { pathExists, readFile, remove, writeFile, ensureDir } from 'fs-extra';
import { dirname, join } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';

/**
 * Handles opting in to cleartext (HTTP) traffic through the app module's `network-security-config.xml`.
 *
 * Whatever the CLI changes is tracked by a marker comment inside the config file itself, so it can be
 * reverted later without touching anything the app owned before:
 *
 *   <!-- capacitor:cleartext created ref orig=false -->
 *
 *   created   the CLI created the file (the revert deletes it)
 *   ref       the CLI added android:networkSecurityConfig to the app manifest (the revert removes it)
 *   orig=...  state of <base-config cleartextTrafficPermitted> before the CLI changed it:
 *             true | false | absent (attribute not set) | added (the CLI added the whole <base-config>)
 */

const DEFAULT_CONFIG_NAME = 'network_security_config';
const MARKER_NAME = 'capacitor:cleartext';
const MARKER_REGEX = new RegExp(`[ \\t]*<!--\\s*${MARKER_NAME}([^>]*?)-->[ \\t]*\\r?\\n?`);
const BASE_CONFIG_REGEX = /<base-config\b[^>]*>/;
const CLEARTEXT_ATTR_REGEX = /(\bcleartextTrafficPermitted\s*=\s*)(["'])(.*?)\2/;
const ROOT_REGEX = /<network-security-config\b[^>]*?(\/?)>/;
const APPLICATION_REGEX = /<application\b/;
const CONFIG_REF_REGEX = /android:networkSecurityConfig\s*=\s*"@xml\/([^"]+)"/;

type OriginalValue = 'true' | 'false' | 'absent' | 'added';

interface Marker {
  created: boolean;
  ref: boolean;
  orig?: OriginalValue;
}

const LEGACY_CORDOVA_PLUGINS_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
</network-security-config>
`;

function parseMarker(xml: string): Marker | undefined {
  const match = MARKER_REGEX.exec(xml);
  if (!match) {
    return undefined;
  }
  const tokens = match[1].trim().split(/\s+/);
  const orig = tokens.find((t) => t.startsWith('orig='))?.slice('orig='.length) as OriginalValue | undefined;
  return { created: tokens.includes('created'), ref: tokens.includes('ref'), orig };
}

function buildMarker(marker: Marker): string {
  const parts = [MARKER_NAME];
  if (marker.created) {
    parts.push('created');
  }
  if (marker.ref) {
    parts.push('ref');
  }
  if (marker.orig) {
    parts.push(`orig=${marker.orig}`);
  }
  return `<!-- ${parts.join(' ')} -->`;
}

function getCleartextValue(tag: string): string | undefined {
  return CLEARTEXT_ATTR_REGEX.exec(tag)?.[3];
}

function setCleartextValue(tag: string, value: string | undefined): string {
  const hasAttr = CLEARTEXT_ATTR_REGEX.test(tag);
  if (value === undefined) {
    return hasAttr ? tag.replace(new RegExp(`\\s*${CLEARTEXT_ATTR_REGEX.source}`), '') : tag;
  }
  if (hasAttr) {
    return tag.replace(CLEARTEXT_ATTR_REGEX, `$1$2${value}$2`);
  }
  return tag.replace(/\s*(\/?)>$/, (_, slash) => ` cleartextTrafficPermitted="${value}"${slash ? ' />' : '>'}`);
}

function indentOf(xml: string, index: number): string {
  const lineStart = xml.lastIndexOf('\n', index - 1) + 1;
  return /^[ \t]*/.exec(xml.slice(lineStart, index))?.[0] ?? '';
}

/**
 * Returns the config XML with `cleartextTrafficPermitted="true"` on its `<base-config>`.
 * When `xml` is undefined a minimal config is generated. Nothing else in the file is touched.
 */
function enableCleartext(xml: string | undefined, flags: { ref: boolean }): string {
  if (xml === undefined) {
    return `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    ${buildMarker({ created: true, ref: flags.ref })}
    <base-config cleartextTrafficPermitted="true" />
</network-security-config>
`;
  }

  const existing = parseMarker(xml);
  const baseConfig = BASE_CONFIG_REGEX.exec(xml);

  if (existing) {
    // Already enabled by the CLI: only make sure the value is still true.
    return baseConfig ? xml.replace(baseConfig[0], setCleartextValue(baseConfig[0], 'true')) : xml;
  }

  if (baseConfig) {
    const original = (getCleartextValue(baseConfig[0]) as OriginalValue | undefined) ?? 'absent';
    const indent = indentOf(xml, baseConfig.index);
    const marker = `${buildMarker({ created: false, ref: flags.ref, orig: original })}\n${indent}`;
    return (
      xml.slice(0, baseConfig.index) +
      marker +
      setCleartextValue(baseConfig[0], 'true') +
      xml.slice(baseConfig.index + baseConfig[0].length)
    );
  }

  const root = ROOT_REGEX.exec(xml);
  if (!root) {
    throw new Error('missing <network-security-config> root element');
  }
  const marker = buildMarker({ created: false, ref: flags.ref, orig: 'added' });
  const addition = `\n    ${marker}\n    <base-config cleartextTrafficPermitted="true" />`;
  if (root[1] === '/') {
    const open = root[0].replace(/\s*\/>$/, '>');
    return xml.replace(root[0], `${open}${addition}\n</network-security-config>`);
  }
  const end = root.index + root[0].length;
  return xml.slice(0, end) + addition + (/^\s/.test(xml.slice(end)) ? '' : '\n') + xml.slice(end);
}

/**
 * Undoes `enableCleartext`. Returns `null` when the file should be deleted, `undefined` when the CLI
 * never touched it, and the restored XML otherwise.
 */
function revertCleartext(xml: string): string | null | undefined {
  const marker = parseMarker(xml);
  if (!marker) {
    return undefined;
  }
  if (marker.created) {
    return null;
  }

  const withoutMarker = xml.replace(MARKER_REGEX, '');
  const baseConfig = BASE_CONFIG_REGEX.exec(withoutMarker);
  if (!baseConfig) {
    return withoutMarker;
  }
  if (marker.orig === 'added') {
    const isSelfClosing = baseConfig[0].endsWith('/>');
    if (isSelfClosing) {
      const indent = indentOf(withoutMarker, baseConfig.index);
      return withoutMarker.replace(new RegExp(`${indent}${escapeRegex(baseConfig[0])}[ \\t]*\\r?\\n?`), '');
    }
    return withoutMarker.replace(baseConfig[0], setCleartextValue(baseConfig[0], 'false'));
  }
  const original = marker.orig === 'absent' || marker.orig === undefined ? undefined : marker.orig;
  return withoutMarker.replace(baseConfig[0], setCleartextValue(baseConfig[0], original));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addManifestRef(manifest: string): string {
  return manifest.replace(
    APPLICATION_REGEX,
    `<application android:networkSecurityConfig="@xml/${DEFAULT_CONFIG_NAME}"`,
  );
}

function removeManifestRef(manifest: string): string {
  return manifest.replace(new RegExp(`\\s+android:networkSecurityConfig\\s*=\\s*"@xml/${DEFAULT_CONFIG_NAME}"`), '');
}

/**
 * Enables or disables cleartext traffic on the app module (`android/app`), leaving any
 * network-security-config the app already has intact besides `cleartextTrafficPermitted`.
 */
export async function setAndroidCleartext(config: Config, enabled: boolean): Promise<void> {
  const manifestPath = join(config.android.srcMainDirAbs, 'AndroidManifest.xml');
  if (!(await pathExists(manifestPath))) {
    return;
  }

  const manifest = await readFile(manifestPath, 'utf-8');
  const referencedName = CONFIG_REF_REGEX.exec(manifest)?.[1];
  const configPath = join(config.android.resDirAbs, 'xml', `${referencedName ?? DEFAULT_CONFIG_NAME}.xml`);
  const configExists = await pathExists(configPath);

  if (enabled) {
    if (referencedName && !configExists) {
      logger.warn(
        `Could not enable cleartext traffic: ${manifestPath} references @xml/${referencedName}, but ${configPath} does not exist.`,
      );
      return;
    }
    const current = configExists ? await readFile(configPath, 'utf-8') : undefined;
    const addRef = !referencedName;
    let updated: string;
    try {
      updated = enableCleartext(current, { ref: addRef });
    } catch (e: any) {
      logger.warn(
        `Could not enable cleartext traffic: ${configPath} is not a valid network security config (${e.message}).`,
      );
      return;
    }
    await ensureDir(dirname(configPath));
    await writeFile(configPath, updated);
    if (addRef) {
      await writeFile(manifestPath, addManifestRef(manifest));
    }
    return;
  }

  if (!configExists) {
    return;
  }
  const current = await readFile(configPath, 'utf-8');
  const marker = parseMarker(current);
  const reverted = revertCleartext(current);
  if (reverted === undefined) {
    return;
  }
  if (reverted === null) {
    await remove(configPath);
  } else {
    await writeFile(configPath, reverted);
  }
  if (marker?.ref && referencedName === DEFAULT_CONFIG_NAME) {
    await writeFile(manifestPath, removeManifestRef(manifest));
  }
}

/**
 * Cleartext used to be written to the generated `capacitor-cordova-android-plugins` module, where it never
 * reached Capacitor-only apps. Removes the file generated by older CLI versions.
 */
export async function removeLegacyCordovaPluginsConfig(config: Config): Promise<void> {
  const legacyPath = join(
    config.android.cordovaPluginsDirAbs,
    'src',
    'main',
    'res',
    'xml',
    `${DEFAULT_CONFIG_NAME}.xml`,
  );
  if (!(await pathExists(legacyPath))) {
    return;
  }
  if ((await readFile(legacyPath, 'utf-8')).trim() === LEGACY_CORDOVA_PLUGINS_CONFIG.trim()) {
    await remove(legacyPath);
  }
}

export const __testables = {
  enableCleartext,
  revertCleartext,
  addManifestRef,
  removeManifestRef,
  parseMarker,
};
