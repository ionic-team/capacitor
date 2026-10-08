import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs-extra';
import { join, sep } from 'path';

import { runTask } from '../common';
import type { Config } from '../definitions';
import { logger } from '../log';
import { deleteFolderRecursive, readdirp } from '../util/fs';
import { hasSwiftUISceneManifest, setSwiftUISceneManifest } from '../util/spm';
import { extractTemplate } from '../util/template';
import { addSwiftFileToAppTarget, removeStoryboardFromAppTarget, removeSwiftFileFromAppTarget } from '../util/xcode';

type MigrationState = 'eligible' | 'already-migrated';

interface SwiftUIDetectionSignals {
  hasSwiftUIManifest: boolean;
  hasAppStruct: boolean;
  hasCapacitorView: boolean;
  hasDelegateAdaptorShape: boolean;
}

interface TemplateAssets {
  app: string;
  capacitorView: string;
}

type AppDelegateRewrite = { status: 'rewritten'; source: string } | { status: 'skipped'; reason: string };

const OPEN_URL_SIG = /func application\([^)]*\bopen url:/;
const CONTINUE_SIG = /func application\([^)]*\bcontinue userActivity:/;
const CONFIGURATION_FOR_CONNECTING_SIG = /func application\([^)]*\bconfigurationForConnecting\b/;

const SCENE_WILL_CONNECT_SIG = /func scene\([^)]*\bwillConnectTo session:/;
const SCENE_OPEN_URL_CONTEXTS_SIG = /func scene\([^)]*\bopenURLContexts\b/;
const SCENE_CONTINUE_SIG = /func scene\([^)]*\bcontinue userActivity:/;
const SCENE_DELEGATE_PROXY = 'SceneDelegateProxy.shared';
const STOCK_WILL_CONNECT_BODY = [
  /^guard let windowScene = scene as\? UIWindowScene else \{ return \}$/,
  /^window = UIWindow\(windowScene: windowScene\)$/,
  /^window\?\.rootViewController = CAPBridgeViewController\(\)$/,
  /^window\?\.makeKeyAndVisible\(\)$/,
  /^SceneDelegateProxy\.shared\.scene\(/,
];
const STOCK_WINDOW_PROPERTY = /^var\s+window\s*:\s*UIWindow\?$/;

export async function migrateToSwiftUI(config: Config): Promise<void> {
  const signals = readDetectionSignals(config);

  if (classify(signals) === 'already-migrated') {
    logger.info('SwiftUI migration: project already uses the SwiftUI App-struct layout, skipping.');
    return;
  }
  if (hasAnySignal(signals)) {
    logger.info(
      `SwiftUI migration: resuming a partially migrated project (${describeSignals(signals)}); ` +
        `completing the missing steps.`,
    );
  }

  const appDelegatePath = join(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');
  const rewrite = planAppDelegateRewrite(appDelegatePath);
  if (rewrite.status === 'skipped') {
    logger.warn(`SwiftUI migration: skipping automated migration — ${rewrite.reason}`);
    printManualSteps();
    return;
  }

  const assets = await loadTemplateAssets(config);
  if (!assets) {
    logger.error('SwiftUI migration: could not read shipped iOS template assets; skipping.');
    return;
  }

  await runTask('Pointing Info.plist at the SwiftUI scene setup.', async () => {
    const result = await setSwiftUISceneManifest(config);
    if (result.status === 'skipped') {
      logger.warn(`Info.plist not updated: ${result.reason}`);
    }
  });

  await runTask('Writing App.swift and CapacitorView.swift.', async () => {
    const files: [string, string][] = [
      ['App.swift', assets.app],
      ['CapacitorView.swift', assets.capacitorView],
    ];
    for (const [name, contents] of files) {
      if (!writeAppTargetFile(config, name, contents)) {
        logger.warn(`${name} already exists, skipping.`);
      }
    }
  });

  await runTask('Converting AppDelegate.swift into a UIApplicationDelegateAdaptor.', async () => {
    writeFileSync(appDelegatePath, rewrite.source);
  });

  let registrationFailed = false;
  await runTask('Registering App.swift and CapacitorView.swift with the Xcode App target.', async () => {
    const pbxprojPath = join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');
    for (const name of ['App.swift', 'CapacitorView.swift']) {
      try {
        const { added } = addSwiftFileToAppTarget(pbxprojPath, 'App', name);
        if (!added) {
          logger.warn(`${name} is already registered in the App target, skipping.`);
        }
      } catch (err: any) {
        registrationFailed = true;
        logger.warn(
          `Could not register ${name} automatically: ${err?.message ?? err}. ` +
            `Add ${name} to the App target in Xcode manually.`,
        );
      }
    }
  });

  if (registrationFailed) {
    logger.warn('Leaving the UIKit entry-point files in place because the App target was not fully updated.');
  } else {
    await runTask('Removing the leftover UIKit entry-point files.', async () => {
      removeLeftoverUIKitFiles(config);
    });
  }

  await scanAndWarn(config);
  printNextSteps();
}

/**
 * Drop the UIKit entry point the SwiftUI App struct replaces.
 *
 * Deregisters before unlinking so a pbxproj that cannot be rewritten leaves a working
 * project behind rather than a dangling reference. LaunchScreen.storyboard stays: Apple
 * still requires a launch storyboard.
 */
function removeLeftoverUIKitFiles(config: Config): void {
  const pbxprojPath = join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');

  const sceneDelegatePath = join(config.ios.nativeTargetDirAbs, 'SceneDelegate.swift');
  if (existsSync(sceneDelegatePath)) {
    if (isStockSceneDelegate(readFileSync(sceneDelegatePath, 'utf-8'))) {
      removeFile(pbxprojPath, sceneDelegatePath, () =>
        removeSwiftFileFromAppTarget(pbxprojPath, 'SceneDelegate.swift'),
      );
    } else {
      logger.warn(
        `${sceneDelegatePath} carries custom code and was kept. Move its window setup into App.swift and route ` +
          `scene(_:openURLContexts:) and scene(_:continue:) through SceneDelegateProxy.shared from the SwiftUI ` +
          `scene body, then delete the file and its App target reference.`,
      );
    }
  }

  const mainStoryboardPath = join(config.ios.nativeTargetDirAbs, 'Base.lproj', 'Main.storyboard');
  if (existsSync(mainStoryboardPath)) {
    removeFile(pbxprojPath, mainStoryboardPath, () => removeStoryboardFromAppTarget(pbxprojPath, 'Main.storyboard'));
  }
}

function removeFile(pbxprojPath: string, path: string, deregister: () => void): void {
  try {
    deregister();
  } catch (err: any) {
    logger.warn(
      `Could not deregister ${path} from ${pbxprojPath}: ${err?.message ?? err}. ` +
        `Delete it from the App target in Xcode manually.`,
    );
    return;
  }
  unlinkSync(path);
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
    if (hasCustomDelegateBody(source, OPEN_URL_SIG)) {
      findings.push(`${appDelegatePath}: custom application(_:open:) body — review for UIScene compatibility`);
    }
    if (hasCustomDelegateBody(source, CONTINUE_SIG)) {
      findings.push(`${appDelegatePath}: custom application(_:continue:) body — review for UIScene compatibility`);
    }
  }

  if (findings.length === 0) return;

  logger.warn('UIScene scan found patterns that may need manual review:');
  for (const finding of findings) {
    logger.warn(`  ${finding}`);
  }
}

function hasCustomDelegateBody(
  source: string,
  sigRegex: RegExp,
  proxyToken = 'ApplicationDelegateProxy.shared',
): boolean {
  const body = bracedBody(source, sigRegex);
  if (body === null) return false;
  return codeLines(body).some((line) => !line.includes(proxyToken));
}

/**
 * Whether SceneDelegate.swift still holds exactly what the 8.x template shipped, and so
 * can be deleted without losing anything the developer wrote.
 */
function isStockSceneDelegate(source: string): boolean {
  const classBody = bracedBody(source, /\bclass\s+SceneDelegate\b/);
  if (classBody === null) return false;

  const willConnectBody = bracedBody(classBody, SCENE_WILL_CONNECT_SIG);
  if (
    willConnectBody !== null &&
    !codeLines(willConnectBody).every((line) => STOCK_WILL_CONNECT_BODY.some((stock) => stock.test(line)))
  ) {
    return false;
  }
  if (hasCustomDelegateBody(classBody, SCENE_OPEN_URL_CONTEXTS_SIG, SCENE_DELEGATE_PROXY)) return false;
  if (hasCustomDelegateBody(classBody, SCENE_CONTINUE_SIG, SCENE_DELEGATE_PROXY)) return false;

  let members: string | null = classBody;
  for (const sig of [SCENE_WILL_CONNECT_SIG, SCENE_OPEN_URL_CONTEXTS_SIG, SCENE_CONTINUE_SIG]) {
    members = removeMethod(members, sig);
    if (members === null) return false;
  }
  return codeLines(members).every((line) => STOCK_WINDOW_PROPERTY.test(line));
}

function bracedBody(source: string, sigRegex: RegExp): string | null {
  const match = source.match(sigRegex);
  if (!match || match.index === undefined) return null;
  const openIdx = source.indexOf('{', match.index);
  if (openIdx === -1) return null;
  const closeIdx = findMatchingBrace(source, openIdx);
  if (closeIdx === null) return null;
  return source.slice(openIdx + 1, closeIdx);
}

function codeLines(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));
}

function hasCustomWindowSetup(source: string): boolean {
  return source.split('\n').some((line) => {
    const trimmed = line.trim();
    if (!/\bwindow\b/.test(trimmed)) return false;
    if (trimmed.startsWith('//')) return false;
    return !/^var\s+window\s*:\s*UIWindow\?$/.test(trimmed);
  });
}

function printNextSteps(): void {
  logger.info('');
  logger.info('SwiftUI migration next steps:');
  logger.info('  • Review any warnings above for legacy API usage or custom AppDelegate URL/activity handlers.');
  logger.info('  • App.swift now owns the app entry point; move UIKit root-window customizations into its scene body.');
  logger.info('  • Full guide: https://capacitorjs.com/docs/next/updating/9-0');
}

function printManualSteps(): void {
  logger.info('');
  logger.info('Migrate the iOS project to the SwiftUI App-struct layout by hand:');
  logger.info('  • Add App.swift (an @main struct conforming to App) and CapacitorView.swift to the App target.');
  logger.info('  • Drop @main, the UIWindow property, and configurationForConnecting from AppDelegate.');
  logger.info('  • Reference AppDelegate from App.swift with @UIApplicationDelegateAdaptor.');
  logger.info('  • Reduce UIApplicationSceneManifest to UIApplicationSupportsMultipleScenes only.');
  logger.info('  • Remove UIMainStoryboardFile from Info.plist.');
  logger.info('  • Route URLs and universal links from the SwiftUI scene body through');
  logger.info('    SceneDelegateProxy.shared.handle(openURL:) and .handle(userActivity:).');
  logger.info('  • Full guide: https://capacitorjs.com/docs/next/updating/9-0');
}

async function loadTemplateAssets(config: Config): Promise<TemplateAssets | null> {
  const packageManager = await config.ios.packageManager;
  const archiveName = packageManager === 'SPM' ? 'ios-spm-template.tar.gz' : 'ios-pods-template.tar.gz';
  const archivePath = join(config.cli.assetsDirAbs, archiveName);
  const tempDir = join(config.cli.assetsDirAbs, 'tempSwiftUITemplate');

  try {
    await extractTemplate(archivePath, tempDir);
    const appPath = join(tempDir, 'App', 'App', 'App.swift');
    const capacitorViewPath = join(tempDir, 'App', 'App', 'CapacitorView.swift');
    if (!existsSync(appPath) || !existsSync(capacitorViewPath)) {
      return null;
    }
    return {
      app: readFileSync(appPath, 'utf-8'),
      capacitorView: readFileSync(capacitorViewPath, 'utf-8'),
    };
  } finally {
    deleteFolderRecursive(tempDir);
  }
}

function writeAppTargetFile(config: Config, name: string, contents: string): boolean {
  const path = join(config.ios.nativeTargetDirAbs, name);
  if (existsSync(path)) {
    return false;
  }
  writeFileSync(path, contents);
  return true;
}

function planAppDelegateRewrite(path: string): AppDelegateRewrite {
  if (!existsSync(path)) {
    return { status: 'skipped', reason: 'AppDelegate.swift not found.' };
  }
  return rewriteAppDelegateForAdaptor(readFileSync(path, 'utf-8'));
}

/**
 * Reshape a pre-9.0 AppDelegate into one that can be adopted by an @main SwiftUI App
 * struct through @UIApplicationDelegateAdaptor.
 *
 * Refuses the rewrite whenever the class does more than the stock template does, because
 * SwiftUI takes over both the window and the scene-level URL/activity callbacks.
 */
function rewriteAppDelegateForAdaptor(source: string): AppDelegateRewrite {
  if (!/\bclass\s+AppDelegate\b/.test(source)) {
    return { status: 'skipped', reason: 'no AppDelegate class found in AppDelegate.swift.' };
  }
  if (hasCustomWindowSetup(source)) {
    return {
      status: 'skipped',
      reason: 'AppDelegate manages its own UIWindow, which the SwiftUI App struct now owns.',
    };
  }
  if (hasCustomDelegateBody(source, OPEN_URL_SIG) || hasCustomDelegateBody(source, CONTINUE_SIG)) {
    return {
      status: 'skipped',
      reason:
        'AppDelegate has custom application(_:open:) or application(_:continue:) handling, ' +
        'which scenes no longer call.',
    };
  }

  let rewritten = stripMainAttribute(source);
  rewritten = rewritten.replace(/(\bclass\s+AppDelegate\s*:\s*)UIResponder\b/, '$1NSObject');
  rewritten = rewritten.replace(/^[ \t]*var\s+window\s*:\s*UIWindow\?[ \t]*\r?\n(?:[ \t]*\r?\n)?/m, '');

  const withoutSceneConfiguration = removeMethod(rewritten, CONFIGURATION_FOR_CONNECTING_SIG);
  if (withoutSceneConfiguration === null) {
    return { status: 'skipped', reason: 'could not parse the configurationForConnecting method in AppDelegate.swift.' };
  }

  return { status: 'rewritten', source: withoutSceneConfiguration };
}

function stripMainAttribute(source: string): string {
  return source.replace(/@(?:main|UIApplicationMain)[ \t]*(?:\r?\n[ \t]*)?(?=class\s+AppDelegate\b)/, '');
}

function removeMethod(source: string, sigRegex: RegExp): string | null {
  const match = source.match(sigRegex);
  if (!match || match.index === undefined) {
    return source;
  }
  const openIdx = source.indexOf('{', match.index);
  if (openIdx === -1) {
    return null;
  }
  const closeIdx = findMatchingBrace(source, openIdx);
  if (closeIdx === null) {
    return null;
  }

  const lines = source.split('\n');
  const signatureLine = countNewlines(source.slice(0, match.index));
  const closingLine = countNewlines(source.slice(0, closeIdx));
  const firstLine = signatureLine > 0 && lines[signatureLine - 1].trim() === '' ? signatureLine - 1 : signatureLine;

  lines.splice(firstLine, closingLine - firstLine + 1);
  return lines.join('\n');
}

function findMatchingBrace(source: string, openIdx: number): number | null {
  let depth = 1;
  let i = openIdx + 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  return depth === 0 ? i - 1 : null;
}

function countNewlines(source: string): number {
  let count = 0;
  for (const ch of source) {
    if (ch === '\n') count++;
  }
  return count;
}

function readDetectionSignals(config: Config): SwiftUIDetectionSignals {
  const appStructPath = join(config.ios.nativeTargetDirAbs, 'App.swift');
  const capacitorViewPath = join(config.ios.nativeTargetDirAbs, 'CapacitorView.swift');
  const appDelegatePath = join(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');

  return {
    hasSwiftUIManifest: hasSwiftUISceneManifest(config),
    hasAppStruct: existsSync(appStructPath) && /struct\s+\w+\s*:\s*App\b/.test(readFileSync(appStructPath, 'utf-8')),
    hasCapacitorView: existsSync(capacitorViewPath),
    hasDelegateAdaptorShape:
      existsSync(appDelegatePath) && !/@(?:main|UIApplicationMain)\b/.test(readFileSync(appDelegatePath, 'utf-8')),
  };
}

/**
 * Anything short of all four signals is eligible, not refused: every step below is
 * individually idempotent, so a run interrupted part-way is finished by running again.
 */
function classify(signals: SwiftUIDetectionSignals): MigrationState {
  return signalValues(signals).every(Boolean) ? 'already-migrated' : 'eligible';
}

function hasAnySignal(signals: SwiftUIDetectionSignals): boolean {
  return signalValues(signals).some(Boolean);
}

function signalValues({
  hasSwiftUIManifest,
  hasAppStruct,
  hasCapacitorView,
  hasDelegateAdaptorShape,
}: SwiftUIDetectionSignals): boolean[] {
  return [hasSwiftUIManifest, hasAppStruct, hasCapacitorView, hasDelegateAdaptorShape];
}

function describeSignals({
  hasSwiftUIManifest,
  hasAppStruct,
  hasCapacitorView,
  hasDelegateAdaptorShape,
}: SwiftUIDetectionSignals): string {
  const present: string[] = [];
  const missing: string[] = [];
  (hasSwiftUIManifest ? present : missing).push('SwiftUI UIApplicationSceneManifest');
  (hasAppStruct ? present : missing).push('App.swift');
  (hasCapacitorView ? present : missing).push('CapacitorView.swift');
  (hasDelegateAdaptorShape ? present : missing).push('AppDelegate without @main');
  return `present: [${present.join(', ')}]; missing: [${missing.join(', ')}]`;
}

// Exported for tests.
export const __testables = {
  classify,
  describeSignals,
  hasCustomDelegateBody,
  hasCustomWindowSetup,
  isStockSceneDelegate,
  removeLeftoverUIKitFiles,
  rewriteAppDelegateForAdaptor,
  scanAndWarn,
};
