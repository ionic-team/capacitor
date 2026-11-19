import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

import { execute } from './lib/cli.mjs';
import { root } from './lib/repo.mjs';

/**
 * Generates `ios/Package.swift` from the manifest at the repository root.
 *
 * The root manifest is what a git-URL consumer resolves, so its target paths are repo-relative and
 * it is the only one that can declare the test targets — `ios/Tests/**` uses `@testable import
 * Capacitor`, so it has to live in the same package as the sources. `ios/Package.swift` is the copy
 * published inside @capacitor/ios, which apps depend on by path; from that package's root the
 * sources are at `Sources/`, and `Tests/` is not in the npm `files` list at all.
 *
 * Pass `--check` to verify the committed copy is current instead of rewriting it.
 */
const PATH_PREFIX = 'ios/';

const HEADER = `// DO NOT MODIFY THIS FILE - generated from the Package.swift in the Capacitor repository.
`;

execute(async () => {
  const check = process.argv.includes('--check');
  const rootPath = resolve(root, 'Package.swift');
  const iosPath = resolve(root, 'ios', 'Package.swift');

  const generated = generate(await readFile(rootPath, 'utf-8'));

  if (!check) {
    await writeFile(iosPath, generated);
    console.log('Wrote ios/Package.swift from Package.swift.');
    return;
  }

  if ((await readFile(iosPath, 'utf-8')) !== generated) {
    throw new Error(
      'ios/Package.swift is out of date with Package.swift.\n' +
        'Run `npm run build:package-swift` (or `npm run fmt`) and commit the result.\n' +
        'Edit the root Package.swift, never ios/Package.swift.',
    );
  }

  console.log('ios/Package.swift is up to date.');
});

function generate(source) {
  return insertHeader(stripPathPrefix(removeTestTargets(source)));
}

/** Rebases every target path onto the published package root, where the sources sit at `Sources/`. */
function stripPathPrefix(source) {
  return source.replaceAll(new RegExp(`(\\bpath:\\s*")${PATH_PREFIX}`, 'g'), '$1');
}

/** Drops every `.testTarget(...)` entry, along with the comma that separated it from its neighbour. */
function removeTestTargets(source) {
  let result = source;

  // Splice backwards so each removal leaves the offsets of the earlier ones valid.
  for (const call of findCalls(result, '.testTarget(').reverse()) {
    const [start, end] = withSeparator(result, call);
    result = result.slice(0, start) + result.slice(end);
  }

  return result;
}

/**
 * Extends a deletion over the comma separating the entry from its neighbour. Swift allows a
 * trailing comma in an array literal but not a leading one, so the preceding comma is taken where
 * there is one, and the following comma only when the entry is the first in the array.
 */
function withSeparator(source, { start, end }) {
  let before = start - 1;
  while (before >= 0 && /\s/.test(source[before])) {
    before--;
  }
  if (source[before] === ',') {
    return [before, end];
  }

  let after = end;
  while (after < source.length && /\s/.test(source[after])) {
    after++;
  }
  return [start, source[after] === ',' ? after + 1 : end];
}

/**
 * Locates calls opening with `marker`, skipping any inside a comment or string literal and
 * tracking paren depth so a nested call doesn't end one.
 *
 * Comments have to be skipped in both directions: a commented-out `.testTarget(` would otherwise
 * be spliced out, mangling the comment, and an unbalanced quote inside any comment would put the
 * scanner into string mode and hide every real entry after it.
 */
function findCalls(source, marker) {
  const calls = [];

  for (let index = 0; index < source.length; index++) {
    if (source[index] === '"') {
      index = skipString(source, index);
      continue;
    }

    if (source.startsWith('//', index)) {
      const newline = source.indexOf('\n', index);
      if (newline === -1) {
        break;
      }
      index = newline;
      continue;
    }

    if (source.startsWith('/*', index)) {
      const close = source.indexOf('*/', index + 2);
      if (close === -1) {
        break;
      }
      index = close + 1;
      continue;
    }

    if (!source.startsWith(marker, index)) {
      continue;
    }

    const end = findCallEnd(source, index + marker.length - 1);
    if (end === -1) {
      throw new Error(`Unterminated ${marker} call in Package.swift.`);
    }

    calls.push({ start: index, end });
    index = end - 1;
  }

  return calls;
}

function findCallEnd(source, openParen) {
  let depth = 0;

  for (let cursor = openParen; cursor < source.length; cursor++) {
    const char = source[cursor];
    if (char === '"') {
      cursor = skipString(source, cursor);
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
function skipString(source, open) {
  for (let cursor = open + 1; cursor < source.length; cursor++) {
    if (source[cursor] === '\\') {
      cursor++;
    } else if (source[cursor] === '"') {
      return cursor;
    }
  }

  return source.length;
}

function insertHeader(source) {
  const marker = 'import PackageDescription\n';
  const index = source.indexOf(marker);

  if (index === -1) {
    throw new Error('Package.swift has no `import PackageDescription` line to anchor the header to.');
  }

  const end = index + marker.length;

  return `${source.slice(0, end)}\n${HEADER}${source.slice(end).replace(/^\n+/, '')}`;
}
