import { readFile } from 'fs/promises';
import { resolve } from 'path';

import { execute } from './lib/cli.mjs';
import { root } from './lib/repo.mjs';

/**
 * The repository root manifest is what a git-URL consumer resolves and the only one that can
 * declare the test targets; `ios/Package.swift` is the copy published inside @capacitor/ios, which
 * apps depend on by path. Nothing but the `ios/` path prefix and the test targets may differ.
 */
execute(async () => {
  const rootManifest = parseManifest(await readFile(resolve(root, 'Package.swift'), 'utf-8'), 'ios/');
  const iosManifest = parseManifest(await readFile(resolve(root, 'ios', 'Package.swift'), 'utf-8'));

  const problems = [
    ...compare('product', rootManifest.products, iosManifest.products),
    ...compare('target', rootManifest.targets, iosManifest.targets),
  ];

  if (problems.length > 0) {
    throw new Error(
      `Package.swift and ios/Package.swift have drifted:\n${problems.map((p) => `  - ${p}`).join('\n')}\n` +
        `Apply the change to both; ios/Package.swift omits the test targets and drops the "ios/" path prefix.`,
    );
  }

  console.log('Package.swift and ios/Package.swift agree.');
});

function compare(kind, expected, actual) {
  const problems = [];

  for (const [name, declaration] of expected) {
    if (!actual.has(name)) {
      problems.push(`${kind} "${name}" is missing from ios/Package.swift`);
    } else if (actual.get(name) !== declaration) {
      problems.push(`${kind} "${name}" declares ${actual.get(name)}, expected ${declaration}`);
    }
  }

  for (const name of actual.keys()) {
    if (!expected.has(name)) {
      problems.push(`${kind} "${name}" is only declared in ios/Package.swift`);
    }
  }

  return problems;
}

/** Reads the products and non-test targets out of a manifest, stripping `pathPrefix` from paths. */
function parseManifest(source, pathPrefix = '') {
  const products = new Map();
  for (const [, name, targets] of source.matchAll(/\.library\(\s*name:\s*"([^"]+)",\s*targets:\s*\[([^\]]*)\]/g)) {
    products.set(name, `targets [${quotedStrings(targets).sort().join(', ')}]`);
  }

  const targets = new Map();
  for (const { isTest, body } of targetDeclarations(source)) {
    if (isTest) {
      continue;
    }
    const name = body.match(/name:\s*"([^"]+)"/)?.[1];
    const path = body.match(/\bpath:\s*"([^"]+)"/)?.[1];
    if (!name || !path) {
      throw new Error(`Could not read a name and path out of a target declaration:\n${body}`);
    }
    targets.set(name, `path "${stripPrefix(path, pathPrefix)}"`);
  }

  return { products, targets };
}

/** Splits a manifest into one chunk per `.target(`/`.testTarget(` call. */
function targetDeclarations(source) {
  const matches = [...source.matchAll(/\.(testTarget|target)\(/g)];

  return matches.map((match, index) => ({
    isTest: match[1] === 'testTarget',
    body: source.slice(match.index, matches[index + 1]?.index ?? source.length),
  }));
}

function quotedStrings(source) {
  return [...source.matchAll(/"([^"]+)"/g)].map(([, value]) => value);
}

function stripPrefix(value, prefix) {
  return prefix && value.startsWith(prefix) ? value.slice(prefix.length) : value;
}
