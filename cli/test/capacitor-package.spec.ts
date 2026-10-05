import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

import type { Config } from '../src/definitions';
import {
  findCapacitorDependencyVersion,
  renderCapacitorPackage,
  resolveCapacitorPackage,
  rewriteCapacitorDependency,
} from '../src/util/capacitor-package';

jest.mock('../src/common', () => ({
  getCapacitorPackageVersion: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getCapacitorPackageVersion } = require('../src/common');

const SPM_DIR = '/app/ios/App/CapApp-SPM';

function occurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

function makeConfig(extConfig: any = {}, rootDir = '/app'): Config {
  return {
    app: { rootDir, extConfig },
    ios: { name: 'ios' },
  } as any;
}

describe('capacitor package resolution', () => {
  beforeEach(() => {
    delete process.env.CAPACITOR_IOS_PACKAGE;
    getCapacitorPackageVersion.mockReset();
  });

  describe('default (no override)', () => {
    let appRoot: string;
    let installed: string;

    beforeEach(() => {
      getCapacitorPackageVersion.mockResolvedValue('9.0.0-alpha.8');
      appRoot = realpathSync(mkdtempSync(join(tmpdir(), 'cap-app-')));
      installed = join(appRoot, 'node_modules', '@capacitor', 'ios');
      mkdirSync(installed, { recursive: true });
      writeFileSync(join(installed, 'package.json'), '{ "name": "@capacitor/ios" }');
      writeFileSync(join(installed, 'Package.swift'), '// ios package');
    });

    it('depends on the installed @capacitor/ios by path', async () => {
      const pkg = await resolveCapacitorPackage(makeConfig({}, appRoot));

      expect(pkg.sourceBased).toBe(true);
      expect(pkg.identity).toBe('capacitor');
      expect(pkg.cordovaProduct).toBe('CapacitorCordova');
      expect(pkg.requirement).toEqual({ kind: 'path', absolutePath: installed });
      expect(renderCapacitorPackage(pkg, join(appRoot, 'ios', 'App', 'CapApp-SPM'))).toBe(
        '.package(name: "capacitor", path: "../../../node_modules/@capacitor/ios")',
      );
    });

    it('renders relative to a plugin being rewritten, not just the app package', async () => {
      const pkg = await resolveCapacitorPackage(makeConfig({}, appRoot));

      expect(renderCapacitorPackage(pkg, join(appRoot, 'node_modules', '@capacitor', 'haptics'))).toBe(
        '.package(name: "capacitor", path: "../ios")',
      );
    });

    it('resolves a path whatever requirement style the caller asks for', async () => {
      const pkg = await resolveCapacitorPackage(makeConfig({}, appRoot), 'from');

      expect(pkg.requirement).toEqual({ kind: 'path', absolutePath: installed });
    });

    it('keeps the node_modules entry when the install is a symlink', async () => {
      // npm link and file: installs resolve away to wherever the package really lives; the
      // generated Package.swift is committed, so it must not carry that machine-specific path.
      const checkout = realpathSync(mkdtempSync(join(tmpdir(), 'cap-checkout-')));
      writeFileSync(join(checkout, 'package.json'), '{ "name": "@capacitor/ios" }');
      writeFileSync(join(checkout, 'Package.swift'), '// ios package');
      rmSync(installed, { recursive: true });
      symlinkSync(checkout, installed);

      const pkg = await resolveCapacitorPackage(makeConfig({}, appRoot));

      expect(pkg.requirement).toEqual({ kind: 'path', absolutePath: installed });
    });

    it('reports an @capacitor/ios too old to ship a Package.swift', async () => {
      rmSync(join(installed, 'Package.swift'));

      await expect(resolveCapacitorPackage(makeConfig({}, appRoot))).rejects.toThrow(/has no Package.swift/);
    });

    it('reports a missing @capacitor/ios', async () => {
      rmSync(join(appRoot, 'node_modules'), { recursive: true });

      await expect(resolveCapacitorPackage(makeConfig({}, appRoot))).rejects.toThrow(/Unable to find node_modules/);
    });
  });

  describe('pre-9 projects', () => {
    it('keeps using the prebuilt package and the caller-chosen requirement style', async () => {
      getCapacitorPackageVersion.mockResolvedValue('8.4.0');

      const app = await resolveCapacitorPackage(makeConfig(), 'exact');
      expect(app.sourceBased).toBe(false);
      expect(app.identity).toBe('capacitor-swift-pm');
      expect(app.cordovaProduct).toBe('Cordova');
      expect(renderCapacitorPackage(app, SPM_DIR)).toBe(
        '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.4.0")',
      );

      const plugin = await resolveCapacitorPackage(makeConfig(), 'from');
      expect(renderCapacitorPackage(plugin, SPM_DIR)).toBe(
        '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.4.0")',
      );
    });

    it('ignores an override, which only applies to the source package', async () => {
      getCapacitorPackageVersion.mockResolvedValue('8.4.0');
      process.env.CAPACITOR_IOS_PACKAGE = 'branch:next';

      const pkg = await resolveCapacitorPackage(makeConfig());
      expect(pkg.requirement).toEqual({ kind: 'exact', version: '8.4.0' });
    });
  });

  describe('config override', () => {
    beforeEach(() => getCapacitorPackageVersion.mockResolvedValue('9.0.0-alpha.6'));

    it('tracks a branch', async () => {
      const pkg = await resolveCapacitorPackage(
        makeConfig({ experimental: { ios: { spm: { capacitorPackage: { branch: 'next' } } } } }),
      );
      expect(renderCapacitorPackage(pkg, SPM_DIR)).toBe(
        '.package(url: "https://github.com/ionic-team/capacitor", branch: "next")',
      );
    });

    it('pins a revision, and honours a custom url', async () => {
      const pkg = await resolveCapacitorPackage(
        makeConfig({
          experimental: {
            ios: { spm: { capacitorPackage: { url: 'https://github.com/me/capacitor', revision: 'abc123' } } },
          },
        }),
      );
      expect(renderCapacitorPackage(pkg, SPM_DIR)).toBe(
        '.package(url: "https://github.com/me/capacitor", revision: "abc123")',
      );
    });

    it('rejects setting more than one requirement', async () => {
      await expect(
        resolveCapacitorPackage(
          makeConfig({ experimental: { ios: { spm: { capacitorPackage: { branch: 'next', exact: '9.0.0' } } } } }),
        ),
      ).rejects.toThrow(/more than one/);
    });

    it('rejects an empty requirement', async () => {
      await expect(
        resolveCapacitorPackage(makeConfig({ experimental: { ios: { spm: { capacitorPackage: {} } } } })),
      ).rejects.toThrow(/must set one of/);
    });
  });

  describe('local path override', () => {
    let checkout: string;

    beforeEach(() => {
      getCapacitorPackageVersion.mockResolvedValue('9.0.0-alpha.6');
      checkout = mkdtempSync(join(tmpdir(), 'cap-pkg-'));
      writeFileSync(join(checkout, 'Package.swift'), '// root package');
    });

    it('renders a path relative to the file being written, with a pinned identity', async () => {
      const pkg = await resolveCapacitorPackage(
        makeConfig({ experimental: { ios: { spm: { capacitorPackage: { path: checkout } } } } }),
      );

      const rendered = renderCapacitorPackage(pkg, SPM_DIR);
      expect(rendered).toContain('.package(name: "capacitor", path: "');
      // A differently-named checkout must still be referenced as "capacitor" by products.
      expect(pkg.identity).toBe('capacitor');
    });

    it('resolves a relative path against the app root', async () => {
      const nested = join(checkout, 'app');
      mkdirSync(nested);
      const pkg = await resolveCapacitorPackage(
        makeConfig({ experimental: { ios: { spm: { capacitorPackage: { path: '..' } } } } }, nested),
      );

      expect(pkg.requirement).toEqual({ kind: 'path', absolutePath: resolve(checkout) });
    });

    it('rejects a path that is not a package root', async () => {
      await expect(
        resolveCapacitorPackage(
          makeConfig({ experimental: { ios: { spm: { capacitorPackage: { path: join(checkout, 'ios') } } } } }),
        ),
      ).rejects.toThrow(/No Package.swift found/);
    });

    it('rejects url combined with path', async () => {
      await expect(
        resolveCapacitorPackage(
          makeConfig({
            experimental: { ios: { spm: { capacitorPackage: { url: 'https://example.com', path: checkout } } } },
          }),
        ),
      ).rejects.toThrow(/cannot set both/);
    });
  });

  describe('environment override', () => {
    beforeEach(() => getCapacitorPackageVersion.mockResolvedValue('9.0.0-alpha.6'));

    it('outranks the config file', async () => {
      process.env.CAPACITOR_IOS_PACKAGE = 'branch:my-feature';
      const pkg = await resolveCapacitorPackage(
        makeConfig({ experimental: { ios: { spm: { capacitorPackage: { branch: 'next' } } } } }),
      );

      expect(pkg.requirement).toEqual({ kind: 'branch', branch: 'my-feature' });
    });

    it('infers exact from a bare version', async () => {
      process.env.CAPACITOR_IOS_PACKAGE = '9.2.0';
      const pkg = await resolveCapacitorPackage(makeConfig());

      expect(pkg.requirement).toEqual({ kind: 'exact', version: '9.2.0' });
    });

    it('reports an unparseable value', async () => {
      process.env.CAPACITOR_IOS_PACKAGE = 'nonsense';
      await expect(resolveCapacitorPackage(makeConfig())).rejects.toThrow(/Could not understand/);
    });
  });
});

describe('rewriting an existing Package.swift', () => {
  const pkg = {
    identity: 'capacitor',
    cordovaProduct: 'CapacitorCordova',
    sourceBased: true,
    url: 'https://github.com/ionic-team/capacitor',
    requirement: { kind: 'exact' as const, version: '9.0.0' },
  };

  it('repoints a plugin from the prebuilt package to the source package', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(name: "Plugin", dependencies: [.product(name: "Capacitor", package: "capacitor-swift-pm")])
    ]`;

    const after = rewriteCapacitorDependency(before, pkg, '/plugin');

    expect(after).toContain('.package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")');
    expect(after).toContain('.product(name: "Capacitor", package: "capacitor")');
    expect(after).not.toContain('capacitor-swift-pm');
  });

  it('leaves unrelated dependencies alone', () => {
    const before = `.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/other/thing.git", from: "1.0.0")`;

    const after = rewriteCapacitorDependency(before, pkg, '/plugin');
    expect(after).toContain('.package(url: "https://github.com/other/thing.git", from: "1.0.0")');
  });

  it('handles a nested requirement without truncating the call', () => {
    const before = `.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", .upToNextMajor(from: "8.0.0"))`;
    const after = rewriteCapacitorDependency(before, pkg, '/plugin');

    expect(after).toBe('.package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")');
  });

  it('is idempotent once already repointed', () => {
    const once = rewriteCapacitorDependency(
      '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")',
      pkg,
      '/plugin',
    );
    expect(rewriteCapacitorDependency(once, pkg, '/plugin')).toBe(once);
  });

  it('collapses a manifest declaring both the prebuilt and source packages', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")
    ]`;

    const after = rewriteCapacitorDependency(before, pkg, '/plugin');

    expect(occurrences(after, '.package(')).toBe(1);
    expect(after).toBe(`dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")
    ]`);
  });

  it('keeps the first entry when the source package is declared first', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor", from: "9.0.0"),
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ]`;

    const after = rewriteCapacitorDependency(before, pkg, '/plugin');

    expect(occurrences(after, '.package(')).toBe(1);
    expect(after).toBe(`dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")
    ]`);
  });

  it('collapses three references down to one, preserving unrelated entries', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/other/thing.git", from: "1.0.0"),
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(path: "../capacitor-swift-pm"),
        .package(url: "https://github.com/ionic-team/capacitor", branch: "next")
    ]`;

    const after = rewriteCapacitorDependency(before, pkg, '/plugin');

    expect(occurrences(after, '.package(')).toBe(2);
    expect(after).toContain('.package(url: "https://github.com/other/thing.git", from: "1.0.0")');
    expect(occurrences(after, '.package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")')).toBe(1);
  });

  it('leaves no leading comma when the surviving entry is last', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/other/thing.git", from: "1.0.0")
    ]`;

    const after = rewriteCapacitorDependency(before, pkg, '/plugin');

    expect(after).not.toMatch(/\[\s*,/);
    expect(after).not.toMatch(/,\s*,/);
  });

  it('ignores a commented-out dependency rather than letting it win the collapse', () => {
    const before = `dependencies: [
        // .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main"),
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ]`;

    const after = rewriteCapacitorDependency(before, pkg, '/plugin');

    expect(after).toContain('// .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")');
    expect(after).toContain('.package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")');
  });

  it('ignores a dependency inside a block comment', () => {
    const before = `/* .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0") */
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")`;

    const after = rewriteCapacitorDependency(before, pkg, '/plugin');

    expect(after).toContain(
      '/* .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0") */',
    );
    expect(after).toContain('.package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")');
  });

  it('stays idempotent after collapsing', () => {
    const once = rewriteCapacitorDependency(
      `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")
    ]`,
      pkg,
      '/plugin',
    );

    expect(rewriteCapacitorDependency(once, pkg, '/plugin')).toBe(once);
  });

  describe('onto a path dependency', () => {
    const pathPkg = {
      ...pkg,
      requirement: { kind: 'path' as const, absolutePath: '/app/node_modules/@capacitor/ios' },
    };
    const pluginDir = '/app/node_modules/@capacitor/haptics';

    it('repoints a plugin at the installed package', () => {
      const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor", from: "9.0.0")
    ],
    targets: [
        .target(name: "Plugin", dependencies: [.product(name: "Capacitor", package: "capacitor")])
    ]`;

      const after = rewriteCapacitorDependency(before, pathPkg, pluginDir);

      expect(after).toContain('.package(name: "capacitor", path: "../ios")');
      expect(after).toContain('.product(name: "Capacitor", package: "capacitor")');
    });

    it('repoints a path left behind by an earlier sync', () => {
      const before = '.package(name: "capacitor", path: "../../../somewhere/else")';

      expect(rewriteCapacitorDependency(before, pathPkg, pluginDir)).toBe(
        '.package(name: "capacitor", path: "../ios")',
      );
    });

    it('is idempotent', () => {
      const once = rewriteCapacitorDependency(
        '.package(url: "https://github.com/ionic-team/capacitor", from: "9.0.0")',
        pathPkg,
        pluginDir,
      );

      expect(rewriteCapacitorDependency(once, pathPkg, pluginDir)).toBe(once);
    });

    it('leaves a similarly named plugin package alone', () => {
      const before = '.package(name: "capacitor-plugin-foo", path: "../foo")';

      expect(rewriteCapacitorDependency(before, pathPkg, pluginDir)).toBe(before);
    });
  });

  it('reads the pinned version from either requirement style', () => {
    expect(
      findCapacitorDependencyVersion(
        '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.4.0")',
      ),
    ).toBe('8.4.0');
    expect(
      findCapacitorDependencyVersion('.package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")'),
    ).toBe('9.0.0');
    expect(
      findCapacitorDependencyVersion('.package(url: "https://github.com/other/thing.git", from: "1.0.0")'),
    ).toBeUndefined();
  });
});
