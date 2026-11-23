import { existsSync, realpathSync } from 'fs-extra';
import { dirname, relative, resolve } from 'path';

import type { Config } from '../definitions';
import { fatal } from '../errors';

import { convertToUnixPath } from './fs';
import { resolveNode } from './node';

export const SOURCE_PACKAGE_IDENTITY = 'capacitor-ios';

/** Matches the source package's git URL, with or without `.git`, but not repos sharing its prefix. */
const SOURCE_PACKAGE_URL = /url:\s*"https:\/\/github\.com\/ionic-team\/capacitor(?:\.git)?\/?"/i;

/**
 * Names a path dependency on Capacitor may carry: the current identity, and the one syncs before
 * the `capacitor-ios` rename pinned. A plugin rewritten by such a sync keeps the old name until
 * it is synced again.
 */
const PINNED_PACKAGE_NAMES = [SOURCE_PACKAGE_IDENTITY, 'capacitor'];

/** Product providing the Cordova compatibility layer. */
export const CORDOVA_PRODUCT = 'CapacitorCordova';

/** The npm package the Swift package ships inside. */
const PLATFORM_PACKAGE = '@capacitor/ios';

/** Plugins published before Capacitor 9 depend on the platform as a prebuilt xcframework. */
const BINARY_PACKAGE_IDENTITY = 'capacitor-swift-pm';

/**
 * Cordova plugins that ship their own `Package.swift` depend on `apache/cordova-ios` for the
 * `Cordova` product, which the Capacitor source package also vends.
 */
const CORDOVA_PACKAGE_URL = /url:\s*"https:\/\/github\.com\/apache\/cordova-ios(?:\.git)?\/?"/i;

/**
 * Resolves the Capacitor Swift package generated `Package.swift` files should depend on: the
 * `@capacitor/ios` npm already installed in the app, which ships the package alongside the sources.
 *
 * Resolving from `node_modules` keeps the native runtime and the `@capacitor/core` bridge it is
 * versioned against on the same release, with no git tag to line up against the npm version. It
 * also carries no version for the app package and any generated plugin packages to disagree about.
 */
export async function resolveCapacitorPackagePath(config: Config): Promise<string> {
  const packageJsonPath = resolveNode(config.app.rootDir, PLATFORM_PACKAGE, 'package.json');

  if (!packageJsonPath) {
    fatal(`Unable to find node_modules/${PLATFORM_PACKAGE}.\nAre you sure ${PLATFORM_PACKAGE} is installed?`);
  }

  const absolutePath = installDirectory(dirname(packageJsonPath), config.app.rootDir);

  if (!existsSync(resolve(absolutePath, 'Package.swift'))) {
    fatal(
      `The installed ${PLATFORM_PACKAGE} has no Package.swift (looked in ${absolutePath}).\n` +
        `Early 9.0.0 alphas did not ship one; update ${PLATFORM_PACKAGE} to build with SPM.`,
    );
  }

  return absolutePath;
}

/**
 * Trades the resolved location for the `node_modules` entry that leads to it, when there is one.
 *
 * Node resolves symlinks away, so a linked or `file:`-installed package resolves to wherever it
 * actually lives — an absolute path outside the app, which the generated `Package.swift` is
 * committed with. The entry inside the project stays valid on every machine.
 */
function installDirectory(resolved: string, rootDir: string): string {
  const real = realPath(resolved);
  if (!real) {
    return resolved;
  }

  for (let dir = resolve(rootDir); ; dir = dirname(dir)) {
    const candidate = resolve(dir, 'node_modules', PLATFORM_PACKAGE);
    if (realPath(candidate) === real) {
      return candidate;
    }
    if (dirname(dir) === dir) {
      return resolved;
    }
  }
}

function realPath(path: string): string | undefined {
  try {
    return realpathSync(path);
  } catch {
    return undefined;
  }
}

/** Renders the `.package(...)` entry, with the path made relative to the file being written. */
export function renderCapacitorPackage(absolutePath: string, fromDir: string): string {
  const relPath = convertToUnixPath(relative(fromDir, absolutePath));

  // Pin the identity: for a path dependency SPM would otherwise derive it from the directory
  // name, which breaks `.product(package:)` when the checkout is not named "capacitor".
  return `.package(name: "${SOURCE_PACKAGE_IDENTITY}", path: "${relPath}")`;
}

/**
 * Repoints an existing `Package.swift` at the resolved Capacitor package.
 *
 * Third-party plugins ship a dependency on `capacitor-swift-pm`. From Capacitor 9 the app depends
 * on the source package instead, and SPM treats the two as separate identities that both vend a
 * `Capacitor` product — so a plugin left untouched would either fail to resolve or link a second
 * copy of the framework. Rewriting keeps the whole graph on one identity.
 */
export function rewriteCapacitorDependency(content: string, absolutePath: string, fromDir: string): string {
  const capacitorCalls = findPackageCalls(content).filter((call) => referencesCapacitor(call.text));
  if (capacitorCalls.length === 0) {
    return content;
  }

  // Collected before the calls are replaced: once they are, every one reads `capacitor-ios` and
  // the name each target's `.product(package:)` was written against is gone. The pinned names are
  // included because a sync that renamed only the `.package(...)` entry left products on the old
  // name behind.
  const previousNames = new Set(
    [...capacitorCalls.map((call) => packageReferenceName(call.text)), ...PINNED_PACKAGE_NAMES]
      .filter((name): name is string => name !== undefined)
      .map((name) => name.toLowerCase())
      .filter((name) => name !== SOURCE_PACKAGE_IDENTITY),
  );

  let rewritten = replacePackageCalls(content, renderCapacitorPackage(absolutePath, fromDir));

  // A name some other dependency still answers to belongs to that dependency, not Capacitor.
  const remainingNames = new Set(
    findPackageCalls(rewritten)
      .map((call) => packageReferenceName(call.text)?.toLowerCase())
      .filter((name): name is string => name !== undefined),
  );

  for (const name of previousNames) {
    if (remainingNames.has(name)) {
      continue;
    }
    rewritten = rewritten.replace(
      new RegExp(`(package:\\s*)"${escapeRegExp(name)}"`, 'gi'),
      `$1"${SOURCE_PACKAGE_IDENTITY}"`,
    );
  }

  return rewritten;
}

/**
 * The name a `.product(package:)` uses to refer to the dependency a `.package(...)` call declares:
 * its explicit `name:` when it pins one, otherwise the identity SPM derives from the last
 * component of its URL or path.
 */
function packageReferenceName(call: string): string | undefined {
  const explicit = call.match(/name:\s*"([^"]+)"/);
  if (explicit) {
    return explicit[1];
  }

  const location = call.match(/(?:url|path):\s*"([^"]+)"/);
  if (!location) {
    return undefined;
  }

  const lastComponent = location[1].replace(/\/+$/, '').split('/').pop() ?? '';
  return lastComponent.replace(/\.git$/i, '').toLowerCase() || undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Reads the version an existing `Package.swift` pins Capacitor to, if it pins one. */
export function findCapacitorDependencyVersion(content: string): string | undefined {
  for (const call of findPackageCalls(content)) {
    if (!referencesCapacitor(call.text)) {
      continue;
    }
    const match = call.text.match(/(?:from|exact):\s*"([^"]+)"/);
    if (match) {
      return match[1];
    }
  }
  return undefined;
}

const IOS_PLATFORM_VERSION_REGEX = /\.iOS\(\s*(?:\.v(\d+)|"([\d.]+)")\s*\)/;

export interface DeploymentTargetPatchResult {
  content: string;
  changed: boolean;
  previousVersion: string | null;
}

/**
 * Bumps a Package.swift's declared iOS deployment target (e.g. `.iOS(.v13)` or `.iOS("14.0")`) up to
 * `requiredIosVersion` if it's lower.
 *
 * Only relevant for the source package: it declares `platforms: [.iOS(.v16)]` on its own manifest,
 * and SwiftPM enforces that across the whole graph, so a plugin still declaring an older, lower
 * target fails to resolve with "requires minimum platform version X ... but this target supports Y" —
 * even though the very same plugin links fine against the prebuilt `capacitor-swift-pm`, which never
 * declared a `platforms:` entry for SwiftPM to check against.
 */
export function patchPackageSwiftDeploymentTarget(
  content: string,
  requiredIosVersion: string,
): DeploymentTargetPatchResult {
  const match = content.match(IOS_PLATFORM_VERSION_REGEX);
  if (!match) {
    return { content, changed: false, previousVersion: null };
  }

  const isSymbolic = match[1] !== undefined;
  const previousVersion = isSymbolic ? match[1] : match[2];
  const requiredMajor = Math.trunc(parseFloat(requiredIosVersion));

  if (parseFloat(previousVersion) >= requiredMajor) {
    return { content, changed: false, previousVersion };
  }

  const replacement = isSymbolic ? `.iOS(.v${requiredMajor})` : `.iOS("${requiredMajor}.0")`;
  const patchedContent = content.replace(IOS_PLATFORM_VERSION_REGEX, replacement);

  return { content: patchedContent, changed: true, previousVersion };
}

/**
 * A path dependency carries no URL to match on, so it is matched on its pinned identity — without
 * that, a manifest rewritten by an earlier sync keeps a relative path that no longer resolves once
 * the app, or the package it points at, has moved.
 */
function referencesCapacitor(call: string): boolean {
  if (call.includes(BINARY_PACKAGE_IDENTITY) || SOURCE_PACKAGE_URL.test(call) || CORDOVA_PACKAGE_URL.test(call)) {
    return true;
  }

  const pinned = call.match(/name:\s*"([^"]+)"/);
  return pinned !== null && PINNED_PACKAGE_NAMES.includes(pinned[1].toLowerCase());
}

interface PackageCall {
  start: number;
  /** Exclusive. */
  end: number;
  text: string;
}

/**
 * Locates `.package(...)` calls in code, skipping any inside a comment or string literal.
 *
 * Commented-out calls have to be skipped rather than merely tolerated: `replacePackageCalls`
 * keeps the first match and drops the rest, so a commented dependency above the real one would
 * otherwise be the entry that survives.
 */
function findPackageCalls(content: string): PackageCall[] {
  const marker = '.package(';
  const calls: PackageCall[] = [];

  for (let index = 0; index < content.length; index++) {
    if (content[index] === '"') {
      index = skipString(content, index);
      continue;
    }

    if (content.startsWith('//', index)) {
      const newline = content.indexOf('\n', index);
      if (newline === -1) {
        break;
      }
      index = newline;
      continue;
    }

    if (content.startsWith('/*', index)) {
      const close = content.indexOf('*/', index + 2);
      if (close === -1) {
        break;
      }
      index = close + 1;
      continue;
    }

    if (!content.startsWith(marker, index)) {
      continue;
    }

    const end = findCallEnd(content, index + marker.length - 1);
    if (end === -1) {
      break;
    }

    calls.push({ start: index, end, text: content.slice(index, end) });
    index = end - 1;
  }

  return calls;
}

/** Walks from an opening paren to its match, tracking depth so nested calls don't terminate it. */
function findCallEnd(content: string, openParen: number): number {
  let depth = 0;

  for (let cursor = openParen; cursor < content.length; cursor++) {
    const char = content[cursor];
    if (char === '"') {
      cursor = skipString(content, cursor);
    } else if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
      if (depth === 0) {
        return cursor + 1;
      }
    }
  }

  return -1;
}

/** Returns the index of the closing quote of the string literal opening at `open`. */
function skipString(content: string, open: number): number {
  for (let cursor = open + 1; cursor < content.length; cursor++) {
    if (content[cursor] === '\\') {
      cursor++;
    } else if (content[cursor] === '"') {
      return cursor;
    }
  }

  return content.length;
}

/**
 * Points every Capacitor dependency at `rendered`, collapsing them to a single entry.
 *
 * A manifest supporting both Capacitor 8 and 9 can declare the prebuilt and source packages side
 * by side. Both rewrite to the same text, and SPM rejects a manifest that declares one dependency
 * twice, so the extra entries are removed rather than replaced.
 */
function replacePackageCalls(content: string, rendered: string): string {
  const matches = findPackageCalls(content).filter((call) => referencesCapacitor(call.text));

  if (matches.length === 0) {
    return content;
  }

  const [survivor, ...duplicates] = matches;
  let result = content;

  // Every duplicate sits after the survivor, so splicing them out backwards leaves its offsets
  // valid and guarantees each one is preceded by the comma separating it from an earlier entry.
  for (const call of duplicates.reverse()) {
    result = result.slice(0, startOfEntry(content, call.start)) + result.slice(call.end);
  }

  return result.slice(0, survivor.start) + rendered + result.slice(survivor.end);
}

/**
 * Extends a deletion back over the comma separating an entry from the previous one. Swift allows a
 * trailing comma in an array literal but not a leading one, so the preceding comma is the one to
 * take.
 */
function startOfEntry(content: string, start: number): number {
  let cursor = start - 1;

  while (cursor >= 0 && /\s/.test(content[cursor])) {
    cursor--;
  }

  return content[cursor] === ',' ? cursor : start;
}
