import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs-extra';
import { join, sep } from 'path';

import { runTask } from '../common';
import type { Config } from '../definitions';
import { logger } from '../log';
import { deleteFolderRecursive, readdirp } from '../util/fs';
import { hasSwiftUISceneManifest, setSwiftUISceneManifest } from '../util/spm';
import { extractTemplate } from '../util/template';
import { addSwiftFileToAppTarget, removeStoryboardFromAppTarget } from '../util/xcode';

type MigrationState = 'eligible' | 'already-migrated';

interface SwiftUIDetectionSignals {
  hasSwiftUIManifest: boolean;
  hasAppStruct: boolean;
  hasCapacitorView: boolean;
  hasDelegateAdaptorShape: boolean;
  hasSceneDelegate: boolean;
}

interface TemplateAssets {
  app: string;
  appDelegate: string;
  capacitorView: string;
  sceneDelegate: string;
}

type AppDelegateRewrite = { status: 'rewritten'; source: string } | { status: 'skipped'; reason: string };

const MIGRATION_GUIDE_URL = 'https://capacitorjs.com/docs/next/updating/9-0';

const OPEN_URL_SIG = /func application\([^)]*\bopen url:/;
const CONTINUE_SIG = /func application\([^)]*\bcontinue userActivity:/;
const CONFIGURATION_FOR_CONNECTING_SIG = /func application\([^)]*\bconfigurationForConnecting\b/;
// Kept byte-identical to the shipped templates; migrate-swiftui-stock-app-delegate.spec.ts
// fails if the two drift apart.
const CONFIGURATION_FOR_CONNECTING_METHOD = [
  '    func application(',
  '        _ application: UIApplication,',
  '        configurationForConnecting connectingSceneSession: UISceneSession,',
  '        options: UIScene.ConnectionOptions',
  '    ) -> UISceneConfiguration {',
  '        let configuration = UISceneConfiguration(name: nil, sessionRole: connectingSceneSession.role)',
  '        configuration.delegateClass = SceneDelegate.self',
  '        return configuration',
  '    }',
].join('\n');

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

const APP_DELEGATE_CLASS_SIG = /\bclass\s+AppDelegate\s*:\s*(?:UIResponder|NSObject)\s*,\s*UIApplicationDelegate\s*\{/;
const DID_FINISH_LAUNCHING_SIG = /func application\([^)]*\bdidFinishLaunchingWithOptions\b/;
const APPLICATION_DELEGATE_PROXY = 'ApplicationDelegateProxy.shared';
// Every module a stock AppDelegate has ever imported; anything else is the developer's.
const STOCK_APP_DELEGATE_PREAMBLE = /^(?:import\s+(?:UIKit|Capacitor|Foundation)|@(?:main|UIApplicationMain))$/;

/**
 * The members every stock AppDelegate has carried since Capacitor 5, with the body each is
 * allowed to hold. `configurationForConnecting` takes any body: whatever it names as the
 * delegate class, the 9.0 template replaces it with one naming SceneDelegate.
 */
const STOCK_APP_DELEGATE_METHODS: { sig: RegExp; bodyIsStock: (lines: string[]) => boolean }[] = [
  { sig: DID_FINISH_LAUNCHING_SIG, bodyIsStock: (lines) => lines.length === 1 && lines[0] === 'return true' },
  { sig: /func applicationWillResignActive\(/, bodyIsStock: isEmpty },
  { sig: /func applicationDidEnterBackground\(/, bodyIsStock: isEmpty },
  { sig: /func applicationWillEnterForeground\(/, bodyIsStock: isEmpty },
  { sig: /func applicationDidBecomeActive\(/, bodyIsStock: isEmpty },
  { sig: /func applicationWillTerminate\(/, bodyIsStock: isEmpty },
  { sig: OPEN_URL_SIG, bodyIsStock: (lines) => lines.every((line) => line.includes(APPLICATION_DELEGATE_PROXY)) },
  { sig: CONTINUE_SIG, bodyIsStock: (lines) => lines.every((line) => line.includes(APPLICATION_DELEGATE_PROXY)) },
  { sig: CONFIGURATION_FOR_CONNECTING_SIG, bodyIsStock: () => true },
];

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

  await runTask('Writing App.swift, CapacitorView.swift and SceneDelegate.swift.', async () => {
    const files: [string, string][] = [
      ['App.swift', assets.app],
      ['CapacitorView.swift', assets.capacitorView],
    ];
    for (const [name, contents] of files) {
      if (!writeAppTargetFile(config, name, contents)) {
        logger.warn(`${name} already exists, skipping.`);
      }
    }

    const sceneDelegatePath = join(config.ios.nativeTargetDirAbs, 'SceneDelegate.swift');
    if (writeSceneDelegate(sceneDelegatePath, assets.sceneDelegate) === 'kept') {
      logger.warn(
        `${sceneDelegatePath} carries code of your own, so it was kept. It is still the app's scene delegate, but ` +
          `the SwiftUI App struct now owns the window: move any window setup out of it, and route ` +
          `scene(_:openURLContexts:) and scene(_:continue:) through SceneDelegateProxy.shared from the SwiftUI ` +
          `scene body instead. See ${MIGRATION_GUIDE_URL}.`,
      );
    }
  });

  const replaceAppDelegate = isStockAppDelegate(readFileSync(appDelegatePath, 'utf-8'));
  await runTask('Converting AppDelegate.swift into a UIApplicationDelegateAdaptor.', async () => {
    writeFileSync(appDelegatePath, replaceAppDelegate ? assets.appDelegate : rewrite.source);
  });
  if (!replaceAppDelegate) {
    logger.warn(
      `${appDelegatePath} carries code of your own, so it was converted in place rather than replaced with the ` +
        `slimmed-down Capacitor 9 template. Review what it still holds against ${MIGRATION_GUIDE_URL}.`,
    );
  }

  let registrationFailed = false;
  await runTask('Registering the SwiftUI entry-point files with the Xcode App target.', async () => {
    const pbxprojPath = join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');
    for (const name of ['App.swift', 'CapacitorView.swift', 'SceneDelegate.swift']) {
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
    logger.warn('Leaving Main.storyboard in place because the App target was not fully updated.');
  } else {
    await runTask('Removing the leftover main storyboard.', async () => {
      removeLeftoverStoryboard(config);
    });
  }

  await scanAndWarn(config);
  printNextSteps();
}

/**
 * Put the 9.0 scene delegate in place.
 *
 * The class stays in the app target rather than moving into the framework because
 * UISceneConfiguration.delegateClass takes a type and UIKit instantiates it itself, so the
 * app has to own a concrete class for AppDelegate to name. A stock 8.x file is replaced
 * outright: its window setup belongs to the SwiftUI App struct now.
 */
function writeSceneDelegate(path: string, contents: string): 'written' | 'replaced' | 'kept' {
  if (!existsSync(path)) {
    writeFileSync(path, contents);
    return 'written';
  }
  if (!isStockSceneDelegate(readFileSync(path, 'utf-8'))) {
    return 'kept';
  }
  writeFileSync(path, contents);
  return 'replaced';
}

/**
 * Drop the storyboard the SwiftUI App struct replaces.
 *
 * Deregisters before unlinking so a pbxproj that cannot be rewritten leaves a working
 * project behind rather than a dangling reference. LaunchScreen.storyboard stays: Apple
 * still requires a launch storyboard.
 */
function removeLeftoverStoryboard(config: Config): void {
  const pbxprojPath = join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');

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

/**
 * Whether AppDelegate.swift still holds exactly what a Capacitor template shipped, across
 * every stock shape from 5.x to 8.x, and so can be replaced outright with the 9.0 template
 * rather than surgically rewritten.
 *
 * The 9.0 template keeps only didFinishLaunchingWithOptions: the empty lifecycle stubs are
 * noise, and URL and universal-link routing moved to the SwiftUI scene body, which
 * App.swift wires to SceneDelegateProxy in the same run.
 */
function isStockAppDelegate(source: string): boolean {
  if (!APP_DELEGATE_CLASS_SIG.test(source)) return false;

  const classBody = bracedBody(source, APP_DELEGATE_CLASS_SIG);
  if (classBody === null) return false;

  const outsideClass = source.slice(0, source.search(APP_DELEGATE_CLASS_SIG));
  if (!codeLines(outsideClass).every((line) => STOCK_APP_DELEGATE_PREAMBLE.test(line))) {
    return false;
  }

  let members: string | null = classBody;
  for (const { sig, bodyIsStock } of STOCK_APP_DELEGATE_METHODS) {
    const body = bracedBody(members, sig);
    if (body !== null && !bodyIsStock(codeLines(body))) return false;
    members = removeMethod(members, sig);
    if (members === null) return false;
  }
  return codeLines(members).every((line) => STOCK_WINDOW_PROPERTY.test(line));
}

function isEmpty(lines: string[]): boolean {
  return lines.length === 0;
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
  logger.info(`  • Full guide: ${MIGRATION_GUIDE_URL}`);
}

function printManualSteps(): void {
  logger.info('');
  logger.info('Migrate the iOS project to the SwiftUI App-struct layout by hand:');
  logger.info('  • Add App.swift (an @main struct conforming to App) and CapacitorView.swift to the App target.');
  logger.info('  • Drop @main and the UIWindow property from AppDelegate.');
  logger.info('  • Add SceneDelegate.swift (an empty UIWindowSceneDelegate) to the App target, and keep or add');
  logger.info('    configurationForConnecting in AppDelegate naming it as the scene delegate class.');
  logger.info('  • Reference AppDelegate from App.swift with @UIApplicationDelegateAdaptor.');
  logger.info('  • Reduce UIApplicationSceneManifest to UIApplicationSupportsMultipleScenes only.');
  logger.info('  • Remove UIMainStoryboardFile from Info.plist.');
  logger.info('  • Route URLs and universal links from the SwiftUI scene body through');
  logger.info('    SceneDelegateProxy.shared.handle(openURL:) and .handle(userActivity:).');
  logger.info(`  • Full guide: ${MIGRATION_GUIDE_URL}`);
}

async function loadTemplateAssets(config: Config): Promise<TemplateAssets | null> {
  const packageManager = await config.ios.packageManager;
  const archiveName = packageManager === 'SPM' ? 'ios-spm-template.tar.gz' : 'ios-pods-template.tar.gz';
  const archivePath = join(config.cli.assetsDirAbs, archiveName);
  const tempDir = join(config.cli.assetsDirAbs, 'tempSwiftUITemplate');

  try {
    await extractTemplate(archivePath, tempDir);
    const appPath = join(tempDir, 'App', 'App', 'App.swift');
    const appDelegatePath = join(tempDir, 'App', 'App', 'AppDelegate.swift');
    const capacitorViewPath = join(tempDir, 'App', 'App', 'CapacitorView.swift');
    const sceneDelegatePath = join(tempDir, 'App', 'App', 'SceneDelegate.swift');
    const paths = [appPath, appDelegatePath, capacitorViewPath, sceneDelegatePath];
    if (paths.some((path) => !existsSync(path))) {
      return null;
    }
    return {
      app: readFileSync(appPath, 'utf-8'),
      appDelegate: readFileSync(appDelegatePath, 'utf-8'),
      capacitorView: readFileSync(capacitorViewPath, 'utf-8'),
      sceneDelegate: readFileSync(sceneDelegatePath, 'utf-8'),
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

  // UIKit stops calling these two once the app is scene-based, so leaving them behind
  // would plant dead code a developer could mistake for live routing. Both bodies are
  // known to hold nothing but ApplicationDelegateProxy calls by the guard above; App.swift
  // re-routes them through SceneDelegateProxy in the same run.
  const sigs = [OPEN_URL_SIG, CONTINUE_SIG];
  const names = ['application(_:open:)', 'application(_:continue:)'];
  let stripped: string | null = rewritten;
  for (const [index, sig] of sigs.entries()) {
    stripped = removeMethod(stripped, sig);
    if (stripped === null) {
      return { status: 'skipped', reason: `could not parse the ${names[index]} method in AppDelegate.swift.` };
    }
  }

  const wired = ensureConfigurationForConnecting(stripped);
  if (wired === null) {
    return { status: 'skipped', reason: 'could not find the end of the AppDelegate class in AppDelegate.swift.' };
  }

  return { status: 'rewritten', source: wired };
}

/**
 * Give the AppDelegate the scene configuration that names SceneDelegate.
 *
 * An 8.5 project already has one and keeps it — the class name it points at has not
 * changed. Anything older gains the 9.0 template's version, because without it UIKit
 * builds the scene with no delegate of ours and nothing can answer per-scene callbacks.
 */
function ensureConfigurationForConnecting(source: string): string | null {
  // Located even when the method is already there: an unbalanced class body used to be
  // caught by the strip this replaced, and reporting success on a file we cannot parse
  // is worse than refusing it.
  const match = source.match(/\bclass\s+AppDelegate\b/);
  if (!match || match.index === undefined) return null;
  const openIdx = source.indexOf('{', match.index);
  if (openIdx === -1) return null;
  const closeIdx = findMatchingBrace(source, openIdx);
  if (closeIdx === null) return null;

  if (CONFIGURATION_FOR_CONNECTING_SIG.test(source)) {
    return source;
  }

  return `${source.slice(0, closeIdx)}\n${CONFIGURATION_FOR_CONNECTING_METHOD}\n${source.slice(closeIdx)}`;
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
  const sceneDelegatePath = join(config.ios.nativeTargetDirAbs, 'SceneDelegate.swift');

  return {
    hasSwiftUIManifest: hasSwiftUISceneManifest(config),
    hasAppStruct: existsSync(appStructPath) && /struct\s+\w+\s*:\s*App\b/.test(readFileSync(appStructPath, 'utf-8')),
    hasCapacitorView: existsSync(capacitorViewPath),
    hasDelegateAdaptorShape:
      existsSync(appDelegatePath) && !/@(?:main|UIApplicationMain)\b/.test(readFileSync(appDelegatePath, 'utf-8')),
    // A project migrated before the scene delegate landed has every other marker but no
    // SceneDelegate.swift, so it reads as eligible and the next run completes it.
    hasSceneDelegate:
      existsSync(sceneDelegatePath) &&
      existsSync(appDelegatePath) &&
      CONFIGURATION_FOR_CONNECTING_SIG.test(readFileSync(appDelegatePath, 'utf-8')),
  };
}

/**
 * Anything short of all five signals is eligible, not refused: every step below is
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
  hasSceneDelegate,
}: SwiftUIDetectionSignals): boolean[] {
  return [hasSwiftUIManifest, hasAppStruct, hasCapacitorView, hasDelegateAdaptorShape, hasSceneDelegate];
}

function describeSignals({
  hasSwiftUIManifest,
  hasAppStruct,
  hasCapacitorView,
  hasDelegateAdaptorShape,
  hasSceneDelegate,
}: SwiftUIDetectionSignals): string {
  const present: string[] = [];
  const missing: string[] = [];
  (hasSwiftUIManifest ? present : missing).push('SwiftUI UIApplicationSceneManifest');
  (hasAppStruct ? present : missing).push('App.swift');
  (hasCapacitorView ? present : missing).push('CapacitorView.swift');
  (hasDelegateAdaptorShape ? present : missing).push('AppDelegate without @main');
  (hasSceneDelegate ? present : missing).push('SceneDelegate.swift');
  return `present: [${present.join(', ')}]; missing: [${missing.join(', ')}]`;
}

// Exported for tests.
export const __testables = {
  CONFIGURATION_FOR_CONNECTING_METHOD,
  classify,
  describeSignals,
  hasCustomDelegateBody,
  hasCustomWindowSetup,
  isStockAppDelegate,
  isStockSceneDelegate,
  removeLeftoverStoryboard,
  rewriteAppDelegateForAdaptor,
  scanAndWarn,
  writeSceneDelegate,
};
