import { existsSync, readFileSync, writeFileSync } from 'fs-extra';
import { join } from 'path';

import { runTask } from '../common';
import type { Config } from '../definitions';
import { logger } from '../log';
import { deleteFolderRecursive } from '../util/fs';
import { addSceneManifestIfNeeded, hasSceneManifest } from '../util/spm';
import { extractTemplate } from '../util/template';

type PreUISceneState = 'eligible' | 'already-migrated' | 'partial' | 'ineligible';

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
    case 'ineligible':
      logger.info('UIScene migration: no iOS App target detected, skipping.');
      return;
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

  logger.info('UIScene migration: Xcode project registration coming in a later stage.');
  logger.info('UIScene migration: source scan for legacy APIs coming in a later stage.');
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
};
