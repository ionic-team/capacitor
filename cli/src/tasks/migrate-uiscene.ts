import { existsSync, readFileSync, writeFileSync } from 'fs-extra';
import { join, sep } from 'path';

import { runTask } from '../common';
import type { Config } from '../definitions';
import { logger } from '../log';
import { deleteFolderRecursive, readdirp } from '../util/fs';
import { addSceneManifestIfNeeded, hasSceneManifest } from '../util/spm';
import { extractTemplate } from '../util/template';
import { addSwiftFileToAppTarget } from '../util/xcode';

type PreUISceneState = 'eligible' | 'already-migrated' | 'partial';

interface UISceneDetectionSignals {
  hasManifest: boolean;
  hasSceneDelegate: boolean;
  hasConfigurationForConnecting: boolean;
}

interface TemplateAssets {
  sceneDelegate: string;
  configurationForConnectingSnippet: string;
}

export async function migrateToUIScene(config: Config): Promise<void> {
  const signals = readDetectionSignals(config);
  const state = classify(signals);

  switch (state) {
    case 'already-migrated':
      logger.info('UIScene migration: project already migrated, skipping.');
      return;
    case 'partial':
      logger.warn(
        `UIScene migration: project is in a partial state (${describeSignals(signals)}). ` +
          `Skipping automated migration — finish the migration by hand or reset to a clean 8.4 state first.`,
      );
      return;
    case 'eligible':
      break;
  }

  const assets = await loadTemplateAssets(config);
  if (!assets) {
    logger.error('UIScene migration: could not read shipped iOS template assets; skipping.');
    return;
  }

  await runTask('Adding UIApplicationSceneManifest to Info.plist.', () => addSceneManifestIfNeeded(config));

  await runTask('Writing SceneDelegate.swift.', async () => {
    const { written } = writeSceneDelegate(config, assets.sceneDelegate);
    if (!written) {
      logger.warn('SceneDelegate.swift already exists, skipping.');
    }
  });

  await runTask('Patching AppDelegate.swift with configurationForConnecting.', async () => {
    const { patched, reason } = patchAppDelegate(config, assets.configurationForConnectingSnippet);
    if (!patched && reason) {
      logger.warn(`AppDelegate.swift not patched: ${reason}`);
    }
  });

  await runTask('Registering SceneDelegate.swift with the Xcode App target.', async () => {
    const pbxprojPath = join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');
    try {
      const { added } = addSwiftFileToAppTarget(pbxprojPath, 'App', 'SceneDelegate.swift');
      if (!added) {
        logger.warn('SceneDelegate.swift is already registered in the App target, skipping.');
      }
    } catch (err: any) {
      logger.warn(
        `Could not register SceneDelegate.swift automatically: ${err?.message ?? err}. ` +
          'Add SceneDelegate.swift to the App target in Xcode manually.',
      );
    }
  });

  await scanAndWarn(config);
  printNextSteps();
}

async function scanAndWarn(config: Config): Promise<void> {
  const findings: string[] = [];

  const swiftFiles = await readdirp(config.ios.platformDirAbs, {
    filter: (item) => {
      if (!item.stats.isFile()) return false;
      if (!item.path.endsWith('.swift')) return false;
      const p = item.path;
      return (
        !p.includes(`${sep}Pods${sep}`) &&
        !p.includes(`${sep}build${sep}`) &&
        !p.includes(`${sep}DerivedData${sep}`) &&
        !p.includes(`${sep}.build${sep}`)
      );
    },
  });

  const tokenPatterns: { token: RegExp; label: string }[] = [
    { token: /UIApplication\.shared\.applicationState/, label: 'UIApplication.shared.applicationState' },
    { token: /\btmpWindow\b/, label: 'tmpWindow' },
    { token: /\bTmpViewController\b/, label: 'TmpViewController' },
  ];

  for (const filePath of swiftFiles) {
    const source = readFileSync(filePath, 'utf-8');
    source.split('\n').forEach((line, idx) => {
      for (const { token, label } of tokenPatterns) {
        if (token.test(line)) {
          findings.push(`${filePath}:${idx + 1}: uses ${label}`);
        }
      }
    });
  }

  const appDelegatePath = join(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');
  if (existsSync(appDelegatePath)) {
    const source = readFileSync(appDelegatePath, 'utf-8');
    if (hasCustomDelegateBody(source, /func application\([^)]*\bopen url:/)) {
      findings.push(`${appDelegatePath}: custom application(_:open:) body — review for UIScene compatibility`);
    }
    if (hasCustomDelegateBody(source, /func application\([^)]*\bcontinue userActivity:/)) {
      findings.push(`${appDelegatePath}: custom application(_:continue:) body — review for UIScene compatibility`);
    }
  }

  if (findings.length === 0) return;

  logger.warn('UIScene scan found patterns that may need manual review:');
  for (const finding of findings) {
    logger.warn(`  ${finding}`);
  }
}

function hasCustomDelegateBody(source: string, sigRegex: RegExp): boolean {
  const match = source.match(sigRegex);
  if (!match || match.index === undefined) return false;
  const openIdx = source.indexOf('{', match.index);
  if (openIdx === -1) return false;
  let depth = 1;
  let i = openIdx + 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) return false;
  const body = source.slice(openIdx + 1, i - 1);
  const codeLines = body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('//'));
  if (codeLines.length === 0) return false;
  return codeLines.some((l) => !l.includes('ApplicationDelegateProxy.shared'));
}

function printNextSteps(): void {
  logger.info('');
  logger.info('UIScene migration next steps:');
  logger.info('  • Review any warnings above for legacy API usage or custom AppDelegate URL/activity handlers.');
  logger.info('  • Full guide: https://capacitorjs.com/docs/updating/8-5');
}

async function loadTemplateAssets(config: Config): Promise<TemplateAssets | null> {
  const packageManager = await config.ios.packageManager;
  const archiveName = packageManager === 'SPM' ? 'ios-spm-template.tar.gz' : 'ios-pods-template.tar.gz';
  const archivePath = join(config.cli.assetsDirAbs, archiveName);
  const tempDir = join(config.cli.assetsDirAbs, 'tempUISceneTemplate');

  try {
    await extractTemplate(archivePath, tempDir);
    const sceneDelegatePath = join(tempDir, 'App', 'App', 'SceneDelegate.swift');
    const appDelegatePath = join(tempDir, 'App', 'App', 'AppDelegate.swift');
    if (!existsSync(sceneDelegatePath) || !existsSync(appDelegatePath)) {
      return null;
    }
    const sceneDelegate = readFileSync(sceneDelegatePath, 'utf-8');
    const appDelegateSource = readFileSync(appDelegatePath, 'utf-8');
    const configurationForConnectingSnippet = extractConfigurationForConnecting(appDelegateSource);
    if (!configurationForConnectingSnippet) {
      return null;
    }
    return { sceneDelegate, configurationForConnectingSnippet };
  } finally {
    deleteFolderRecursive(tempDir);
  }
}

function writeSceneDelegate(config: Config, contents: string): { written: boolean } {
  const path = join(config.ios.nativeTargetDirAbs, 'SceneDelegate.swift');
  if (existsSync(path)) {
    return { written: false };
  }
  writeFileSync(path, contents);
  return { written: true };
}

function patchAppDelegate(config: Config, snippet: string): { patched: boolean; reason?: string } {
  const path = join(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');
  if (!existsSync(path)) {
    return { patched: false, reason: 'AppDelegate.swift not found.' };
  }
  const source = readFileSync(path, 'utf-8');
  if (source.includes('UISceneConfiguration(name:')) {
    return { patched: false, reason: 'configurationForConnecting already present.' };
  }
  const patched = insertBeforeAppDelegateClassEnd(source, snippet);
  if (!patched) {
    return { patched: false, reason: 'could not locate AppDelegate class body.' };
  }
  writeFileSync(path, patched);
  return { patched: true };
}

function extractConfigurationForConnecting(appDelegateSource: string): string | null {
  const sigRegex = /^ {4}func application\(_ application: UIApplication,\n {21}configurationForConnecting\b/m;
  const sigMatch = appDelegateSource.match(sigRegex);
  if (!sigMatch || sigMatch.index === undefined) {
    return null;
  }
  const openIdx = appDelegateSource.indexOf('{', sigMatch.index);
  if (openIdx === -1) {
    return null;
  }
  let depth = 1;
  let i = openIdx + 1;
  while (i < appDelegateSource.length && depth > 0) {
    const ch = appDelegateSource[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) {
    return null;
  }
  return '\n' + appDelegateSource.slice(sigMatch.index, i) + '\n';
}

function insertBeforeAppDelegateClassEnd(source: string, snippet: string): string | null {
  const classDeclRegex = /\bclass\s+AppDelegate\b[^{]*\{/;
  const match = source.match(classDeclRegex);
  if (!match || match.index === undefined) {
    return null;
  }
  const openIdx = source.indexOf('{', match.index);
  let depth = 1;
  let i = openIdx + 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) {
    return null;
  }
  const closeIdx = i - 1;
  return source.slice(0, closeIdx) + snippet + source.slice(closeIdx);
}

function readDetectionSignals(config: Config): UISceneDetectionSignals {
  const sceneDelegatePath = join(config.ios.nativeTargetDirAbs, 'SceneDelegate.swift');
  const appDelegatePath = join(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');

  return {
    hasManifest: hasSceneManifest(config),
    hasSceneDelegate: existsSync(sceneDelegatePath),
    hasConfigurationForConnecting:
      existsSync(appDelegatePath) && readFileSync(appDelegatePath, 'utf-8').includes('UISceneConfiguration(name:'),
  };
}

function classify(signals: UISceneDetectionSignals): PreUISceneState {
  const { hasManifest, hasSceneDelegate, hasConfigurationForConnecting } = signals;
  const trueCount = [hasManifest, hasSceneDelegate, hasConfigurationForConnecting].filter(Boolean).length;
  if (trueCount === 0) return 'eligible';
  if (trueCount === 3) return 'already-migrated';
  return 'partial';
}

function describeSignals({
  hasManifest,
  hasSceneDelegate,
  hasConfigurationForConnecting,
}: UISceneDetectionSignals): string {
  const present: string[] = [];
  const missing: string[] = [];
  (hasManifest ? present : missing).push('UIApplicationSceneManifest');
  (hasSceneDelegate ? present : missing).push('SceneDelegate.swift');
  (hasConfigurationForConnecting ? present : missing).push('AppDelegate.configurationForConnecting');
  return `present: [${present.join(', ')}]; missing: [${missing.join(', ')}]`;
}

// Exported for tests.
export const __testables = {
  classify,
  describeSignals,
  insertBeforeAppDelegateClassEnd,
  extractConfigurationForConnecting,
  hasCustomDelegateBody,
  scanAndWarn,
};
