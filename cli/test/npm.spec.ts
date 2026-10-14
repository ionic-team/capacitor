import { mkdtempSync, writeFileSync } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';

import { hasBlockedCapacitorScripts, isNpmProject, parseBlockedInstallScripts } from '../src/util/npm';

// Captured from a real `npm install-scripts ls --json` on npm@12.2.0.
const NOTHING_BLOCKED = `{
  "allowScripts": []
}`;

const TWO_BLOCKED = `{
  "allowScripts": [
    {
      "name": "@capacitor/background-runner",
      "changes": [
        {
          "key": "@capacitor/background-runner@3.0.0",
          "change": "pending"
        }
      ]
    },
    {
      "name": "esbuild",
      "changes": [
        {
          "key": "esbuild@0.28.2",
          "change": "pending"
        }
      ]
    }
  ]
}`;

// The same project after `npm install-scripts deny esbuild`.
const ONE_DENIED = `{
  "allowScripts": [
    {
      "name": "@capacitor/background-runner",
      "changes": [
        {
          "key": "@capacitor/background-runner@3.0.0",
          "change": "pending"
        }
      ]
    }
  ]
}`;

describe('parseBlockedInstallScripts', () => {
  it('returns nothing when no scripts are blocked', () => {
    expect(parseBlockedInstallScripts(NOTHING_BLOCKED)).toEqual([]);
  });

  it('names each blocked package and version', () => {
    expect(parseBlockedInstallScripts(TWO_BLOCKED)).toEqual([
      { name: '@capacitor/background-runner', version: '3.0.0' },
      { name: 'esbuild', version: '0.28.2' },
    ]);
  });

  it('omits packages the user already denied', () => {
    expect(parseBlockedInstallScripts(ONE_DENIED)).toEqual([
      { name: '@capacitor/background-runner', version: '3.0.0' },
    ]);
  });

  it('returns nothing when the command failed', () => {
    expect(parseBlockedInstallScripts(null)).toEqual([]);
  });

  it('returns nothing for output that is not JSON', () => {
    expect(parseBlockedInstallScripts('Unknown command: "install-scripts"')).toEqual([]);
  });

  it('returns nothing when allowScripts is missing or not an array', () => {
    expect(parseBlockedInstallScripts('{}')).toEqual([]);
    expect(parseBlockedInstallScripts('{"allowScripts":"nope"}')).toEqual([]);
  });

  it('ignores changes that are not pending', () => {
    const output = '{"allowScripts":[{"name":"esbuild","changes":[{"key":"esbuild@0.28.2","change":"added"}]}]}';
    expect(parseBlockedInstallScripts(output)).toEqual([]);
  });

  it('ignores entries without a name or changes', () => {
    const output = '{"allowScripts":[{"changes":[{"key":"a@1.0.0","change":"pending"}]},{"name":"b"}]}';
    expect(parseBlockedInstallScripts(output)).toEqual([]);
  });

  it('falls back to the raw key when it is not prefixed by the name', () => {
    const output = '{"allowScripts":[{"name":"esbuild","changes":[{"key":"0.28.2","change":"pending"}]}]}';
    expect(parseBlockedInstallScripts(output)).toEqual([{ name: 'esbuild', version: '0.28.2' }]);
  });
});

describe('isNpmProject', () => {
  function project(files: { [name: string]: string }): string {
    const dir = mkdtempSync(join(tmpdir(), 'cap-npm-'));
    for (const [name, contents] of Object.entries(files)) {
      writeFileSync(join(dir, name), contents, { encoding: 'utf-8' });
    }
    return dir;
  }

  it.each([
    ['package-lock.json', true],
    ['npm-shrinkwrap.json', true],
    ['pnpm-lock.yaml', false],
    ['yarn.lock', false],
    ['bun.lock', false],
    ['bun.lockb', false],
  ])('reads %s as npm: %s', async (lockfile, expected) => {
    expect(await isNpmProject(project({ [lockfile]: '' }))).toBe(expected);
  });

  it('prefers the packageManager field over the lockfile', async () => {
    const dir = project({
      'package.json': '{"packageManager":"pnpm@10.0.0"}',
      'package-lock.json': '',
    });
    expect(await isNpmProject(dir)).toBe(false);
  });

  it('treats an unrecognized packageManager field as not npm', async () => {
    const dir = project({ 'package.json': '{"packageManager":"cnpm@1.0.0"}', 'package-lock.json': '' });
    expect(await isNpmProject(dir)).toBe(false);
  });

  it('needs a positive signal, so an empty directory is not npm', async () => {
    expect(await isNpmProject(project({}))).toBe(false);
  });

  it('is not npm for a workspace package, which carries no lockfile of its own', async () => {
    expect(await isNpmProject(project({ 'package.json': '{"name":"myapp"}' }))).toBe(false);
  });
});

describe('hasBlockedCapacitorScripts', () => {
  it('is false when nothing is blocked', () => {
    expect(hasBlockedCapacitorScripts([])).toBe(false);
  });

  it('is true when a Capacitor package is among the blocked ones', () => {
    expect(hasBlockedCapacitorScripts(parseBlockedInstallScripts(TWO_BLOCKED))).toBe(true);
    expect(hasBlockedCapacitorScripts(parseBlockedInstallScripts(ONE_DENIED))).toBe(true);
  });

  it('is false when only unrelated packages are blocked', () => {
    expect(
      hasBlockedCapacitorScripts([
        { name: 'esbuild', version: '0.28.2' },
        { name: 'sharp', version: '0.34.4' },
      ]),
    ).toBe(false);
  });

  it('does not match packages that merely mention capacitor', () => {
    expect(hasBlockedCapacitorScripts([{ name: 'capacitor-plugin-safe-area', version: '4.0.0' }])).toBe(false);
  });
});
