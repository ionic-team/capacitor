import { existsSync } from 'fs-extra';
import { isAbsolute, relative, resolve } from 'path';
import { major, valid } from 'semver';

import { getCapacitorPackageVersion } from '../common';
import type { Config } from '../definitions';
import { fatal } from '../errors';

import { convertToUnixPath } from './fs';

/** Capacitor 9 and up builds the iOS platform from source out of the main repo. */
const SOURCE_PACKAGE_MAJOR = 9;
const SOURCE_PACKAGE_URL = 'https://github.com/ionic-team/capacitor';
const SOURCE_PACKAGE_IDENTITY = 'capacitor';

/** Before Capacitor 9 the platform was consumed as a prebuilt xcframework from a separate repo. */
const BINARY_PACKAGE_URL = 'https://github.com/ionic-team/capacitor-swift-pm.git';
const BINARY_PACKAGE_IDENTITY = 'capacitor-swift-pm';

const ENV_OVERRIDE = 'CAPACITOR_IOS_PACKAGE';
const REQUIREMENT_KEYS = ['path', 'branch', 'revision', 'exact', 'from'] as const;

export type CapacitorRequirement =
  | { kind: 'path'; absolutePath: string }
  | { kind: 'branch'; branch: string }
  | { kind: 'revision'; revision: string }
  | { kind: 'exact'; version: string }
  | { kind: 'from'; version: string };

export interface CapacitorPackage {
  /** SPM package identity, as referenced by `.product(name:package:)`. */
  identity: string;
  /** Product providing the Cordova compatibility layer. */
  cordovaProduct: string;
  /** True when this resolves to the source package (Capacitor 9+). */
  sourceBased: boolean;
  url: string;
  requirement: CapacitorRequirement;
}

/**
 * Resolves which Capacitor Swift package generated `Package.swift` files should depend on.
 *
 * Precedence, most specific first:
 *   1. the `CAPACITOR_IOS_PACKAGE` environment variable
 *   2. `experimental.ios.spm.capacitorPackage` in the Capacitor config
 *   3. the git tag matching the installed `@capacitor/ios` version
 *
 * The environment variable deliberately outranks the config file so a checkout can be pointed at a
 * local or branch build without editing (and risking committing) the app's configuration.
 *
 * `legacyRequirement` only applies to pre-9 projects, where it preserves each caller's existing
 * requirement style. Source-based projects always pin `exact`, because the app package and any
 * generated plugin packages must agree: a prerelease such as `9.0.0-alpha.6` does not satisfy a
 * `from:` range, so mixing the two styles fails to resolve.
 */
export async function resolveCapacitorPackage(
  config: Config,
  legacyRequirement: 'exact' | 'from' = 'exact',
): Promise<CapacitorPackage> {
  const version = await getCapacitorPackageVersion(config, config.ios.name);

  if (major(version) < SOURCE_PACKAGE_MAJOR) {
    return {
      identity: BINARY_PACKAGE_IDENTITY,
      cordovaProduct: 'Cordova',
      sourceBased: false,
      url: BINARY_PACKAGE_URL,
      requirement: { kind: legacyRequirement, version },
    };
  }

  const override = resolveOverride(config);

  return {
    identity: SOURCE_PACKAGE_IDENTITY,
    cordovaProduct: 'CapacitorCordova',
    sourceBased: true,
    url: override?.url ?? SOURCE_PACKAGE_URL,
    requirement: override?.requirement ?? { kind: 'exact', version },
  };
}

/** Renders the `.package(...)` entry, with any path made relative to the file being written. */
export function renderCapacitorPackage(pkg: CapacitorPackage, fromDir: string): string {
  if (pkg.requirement.kind === 'path') {
    const relPath = convertToUnixPath(relative(fromDir, pkg.requirement.absolutePath));
    // Pin the identity: for a path dependency SPM would otherwise derive it from the directory
    // name, which breaks `.product(package:)` when the checkout is not named "capacitor".
    return `.package(name: "${pkg.identity}", path: "${relPath}")`;
  }

  return `.package(url: "${pkg.url}", ${renderRequirement(pkg.requirement)})`;
}

/**
 * Repoints an existing `Package.swift` at the resolved Capacitor package.
 *
 * Third-party plugins ship a dependency on `capacitor-swift-pm`. From Capacitor 9 the app depends
 * on the source package instead, and SPM treats the two as separate identities that both vend a
 * `Capacitor` product — so a plugin left untouched would either fail to resolve or link a second
 * copy of the framework. Rewriting keeps the whole graph on one identity.
 */
export function rewriteCapacitorDependency(content: string, pkg: CapacitorPackage, fromDir: string): string {
  let rewritten = replacePackageCalls(content, renderCapacitorPackage(pkg, fromDir));

  for (const identity of [BINARY_PACKAGE_IDENTITY, SOURCE_PACKAGE_IDENTITY]) {
    rewritten = rewritten.split(`package: "${identity}"`).join(`package: "${pkg.identity}"`);
  }

  return rewritten;
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

function referencesCapacitor(call: string): boolean {
  return call.includes(BINARY_PACKAGE_IDENTITY) || call.includes(`${SOURCE_PACKAGE_URL}`);
}

/** Locates `.package(...)` calls, tracking paren depth so nested calls don't terminate the match. */
function findPackageCalls(content: string): { start: number; end: number; text: string }[] {
  const calls: { start: number; end: number; text: string }[] = [];
  const marker = '.package(';
  let index = content.indexOf(marker);

  while (index !== -1) {
    let depth = 0;
    let inString = false;
    let cursor = index + marker.length - 1;

    for (; cursor < content.length; cursor++) {
      const char = content[cursor];
      if (inString) {
        if (char === '\\') {
          cursor++;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }
      if (char === '"') {
        inString = true;
      } else if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
        if (depth === 0) {
          break;
        }
      }
    }

    if (depth !== 0) {
      break;
    }

    calls.push({ start: index, end: cursor + 1, text: content.slice(index, cursor + 1) });
    index = content.indexOf(marker, cursor + 1);
  }

  return calls;
}

function replacePackageCalls(content: string, rendered: string): string {
  let result = content;

  // Walk backwards so earlier offsets stay valid as we splice.
  for (const call of findPackageCalls(content).reverse()) {
    if (referencesCapacitor(call.text)) {
      result = result.slice(0, call.start) + rendered + result.slice(call.end);
    }
  }

  return result;
}

function renderRequirement(requirement: CapacitorRequirement): string {
  switch (requirement.kind) {
    case 'branch':
      return `branch: "${requirement.branch}"`;
    case 'revision':
      return `revision: "${requirement.revision}"`;
    case 'exact':
      return `exact: "${requirement.version}"`;
    case 'from':
      return `from: "${requirement.version}"`;
    case 'path':
      throw new Error('path requirements are rendered by renderCapacitorPackage');
  }
}

function resolveOverride(config: Config): { url?: string; requirement: CapacitorRequirement } | undefined {
  const baseDir = config.app.rootDir;

  const fromEnv = process.env[ENV_OVERRIDE]?.trim();
  if (fromEnv) {
    return { requirement: parseRequirementSpec(fromEnv, baseDir) };
  }

  const fromConfig = config.app.extConfig.experimental?.ios?.spm?.capacitorPackage;
  if (!fromConfig) {
    return undefined;
  }

  const provided = REQUIREMENT_KEYS.filter((key) => fromConfig[key] !== undefined);
  if (provided.length === 0) {
    fatal(
      `experimental.ios.spm.capacitorPackage must set one of: ${REQUIREMENT_KEYS.join(', ')}.\n` +
        `Remove the entry to use the version matching the installed @capacitor/ios.`,
    );
  }
  if (provided.length > 1) {
    fatal(
      `experimental.ios.spm.capacitorPackage sets more than one of: ${provided.join(', ')}.\n` + `Only one may be set.`,
    );
  }

  const key = provided[0];
  const value = String(fromConfig[key]);

  if (key === 'path') {
    if (fromConfig.url !== undefined) {
      fatal(`experimental.ios.spm.capacitorPackage cannot set both "url" and "path".`);
    }
    return { requirement: pathRequirement(value, baseDir) };
  }

  return { url: fromConfig.url, requirement: { kind: key, ...requirementValue(key, value) } as CapacitorRequirement };
}

function requirementValue(key: (typeof REQUIREMENT_KEYS)[number], value: string) {
  switch (key) {
    case 'branch':
      return { branch: value };
    case 'revision':
      return { revision: value };
    default:
      return { version: value };
  }
}

/**
 * Parses a `CAPACITOR_IOS_PACKAGE` value. Accepts an explicit `kind:value` form, or infers `path`
 * for anything path-shaped and `exact` for a bare version.
 */
function parseRequirementSpec(spec: string, baseDir: string): CapacitorRequirement {
  const separator = spec.indexOf(':');
  if (separator > 0) {
    const key = spec.slice(0, separator);
    const value = spec.slice(separator + 1);
    if ((REQUIREMENT_KEYS as readonly string[]).includes(key)) {
      if (key === 'path') {
        return pathRequirement(value, baseDir);
      }
      return {
        kind: key,
        ...requirementValue(key as (typeof REQUIREMENT_KEYS)[number], value),
      } as CapacitorRequirement;
    }
  }

  if (spec.startsWith('.') || isAbsolute(spec)) {
    return pathRequirement(spec, baseDir);
  }

  if (valid(spec)) {
    return { kind: 'exact', version: spec };
  }

  return fatal(
    `Could not understand ${ENV_OVERRIDE}="${spec}".\n` +
      `Expected one of ${REQUIREMENT_KEYS.map((k) => `${k}:<value>`).join(', ')}, a path, or a version.`,
  );
}

function pathRequirement(value: string, baseDir: string): CapacitorRequirement {
  const absolutePath = resolve(baseDir, value);
  if (!existsSync(resolve(absolutePath, 'Package.swift'))) {
    fatal(
      `No Package.swift found at ${absolutePath}.\n` +
        `A local Capacitor package must point at the repository root, not the ios directory.`,
    );
  }
  return { kind: 'path', absolutePath };
}
