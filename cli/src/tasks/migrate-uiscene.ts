import { existsSync, readFileSync } from 'fs-extra';
import { join } from 'path';

import { runTask } from '../common';
import type { Config } from '../definitions';
import { logger } from '../log';
import { addSceneManifest, hasSceneManifest } from '../util/spm';

type PreUISceneState = 'eligible' | 'already-migrated' | 'partial' | 'ineligible';

interface UISceneDetectionSignals {
  hasManifest: boolean;
  hasSceneDelegate: boolean;
  hasConfigurationForConnecting: boolean;
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

  await runTask('Adding UIApplicationSceneManifest to Info.plist.', async () => {
    const plistPath = join(config.ios.nativeTargetDirAbs, 'Info.plist');
    const { added } = addSceneManifest(plistPath);
    if (!added) {
      logger.warn('UIApplicationSceneManifest already present, skipping.');
    }
  });

  logger.info('UIScene migration: SceneDelegate.swift write coming in a later stage.');
  logger.info('UIScene migration: AppDelegate configurationForConnecting patch coming in a later stage.');
  logger.info('UIScene migration: Xcode project registration coming in a later stage.');
  logger.info('UIScene migration: source scan for legacy APIs coming in a later stage.');
}

function readDetectionSignals(config: Config): UISceneDetectionSignals {
  const plistPath = join(config.ios.nativeTargetDirAbs, 'Info.plist');
  const sceneDelegatePath = join(config.ios.nativeTargetDirAbs, 'SceneDelegate.swift');
  const appDelegatePath = join(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');

  return {
    hasManifest: existsSync(plistPath) && hasSceneManifest(plistPath),
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

function describeSignals({ hasManifest, hasSceneDelegate, hasConfigurationForConnecting }: UISceneDetectionSignals): string {
  const present: string[] = [];
  const missing: string[] = [];
  (hasManifest ? present : missing).push('UIApplicationSceneManifest');
  (hasSceneDelegate ? present : missing).push('SceneDelegate.swift');
  (hasConfigurationForConnecting ? present : missing).push('AppDelegate.configurationForConnecting');
  return `present: [${present.join(', ')}]; missing: [${missing.join(', ')}]`;
}

// Exported for tests.
export const __testables = { classify, describeSignals };
