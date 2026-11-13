import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import type { Config } from '../src/definitions';
import {
  findCapacitorDependencyVersion,
  patchPackageSwiftDeploymentTarget,
  renderCapacitorPackage,
  resolveCapacitorPackagePath,
  rewriteCapacitorDependency,
} from '../src/util/capacitor-package';

function occurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

function makeConfig(rootDir = '/app'): Config {
  return {
    app: { rootDir, extConfig: {} },
    ios: { name: 'ios' },
  } as any;
}

describe('capacitor package resolution', () => {
  let appRoot: string;
  let installed: string;

  beforeEach(() => {
    appRoot = realpathSync(mkdtempSync(join(tmpdir(), 'cap-app-')));
    installed = join(appRoot, 'node_modules', '@capacitor', 'ios');
    mkdirSync(installed, { recursive: true });
    writeFileSync(join(installed, 'package.json'), '{ "name": "@capacitor/ios" }');
    writeFileSync(join(installed, 'Package.swift'), '// ios package');
  });

  it('depends on the installed @capacitor/ios by path', async () => {
    const path = await resolveCapacitorPackagePath(makeConfig(appRoot));

    expect(path).toBe(installed);
    expect(renderCapacitorPackage(path, join(appRoot, 'ios', 'App', 'CapApp-SPM'))).toBe(
      '.package(name: "capacitor", path: "../../../node_modules/@capacitor/ios")',
    );
  });

  it('renders relative to a plugin being rewritten, not just the app package', async () => {
    const path = await resolveCapacitorPackagePath(makeConfig(appRoot));

    expect(renderCapacitorPackage(path, join(appRoot, 'node_modules', '@capacitor', 'haptics'))).toBe(
      '.package(name: "capacitor", path: "../ios")',
    );
  });

  it('keeps the node_modules entry when the install is a symlink', async () => {
    // npm link and file: installs resolve away to wherever the package really lives; the
    // generated Package.swift is committed, so it must not carry that machine-specific path.
    const checkout = realpathSync(mkdtempSync(join(tmpdir(), 'cap-checkout-')));
    writeFileSync(join(checkout, 'package.json'), '{ "name": "@capacitor/ios" }');
    writeFileSync(join(checkout, 'Package.swift'), '// ios package');
    rmSync(installed, { recursive: true });
    symlinkSync(checkout, installed);

    expect(await resolveCapacitorPackagePath(makeConfig(appRoot))).toBe(installed);
  });

  it('reports an @capacitor/ios too old to ship a Package.swift', async () => {
    rmSync(join(installed, 'Package.swift'));

    await expect(resolveCapacitorPackagePath(makeConfig(appRoot))).rejects.toThrow(/has no Package.swift/);
  });

  it('reports a missing @capacitor/ios', async () => {
    rmSync(join(appRoot, 'node_modules'), { recursive: true });

    await expect(resolveCapacitorPackagePath(makeConfig(appRoot))).rejects.toThrow(/Unable to find node_modules/);
  });
});

describe('rewriting an existing Package.swift', () => {
  const installed = '/app/node_modules/@capacitor/ios';
  const pluginDir = '/app/node_modules/@capacitor/haptics';
  const rendered = '.package(name: "capacitor", path: "../ios")';

  const rewrite = (content: string) => rewriteCapacitorDependency(content, installed, pluginDir);

  it('repoints a plugin from the prebuilt package to the installed package', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(name: "Plugin", dependencies: [.product(name: "Capacitor", package: "capacitor-swift-pm")])
    ]`;

    const after = rewrite(before);

    expect(after).toContain(rendered);
    expect(after).toContain('.product(name: "Capacitor", package: "capacitor")');
    expect(after).not.toContain('capacitor-swift-pm');
  });

  it('repoints a plugin already on the source package', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor", from: "9.0.0")
    ],
    targets: [
        .target(name: "Plugin", dependencies: [.product(name: "Capacitor", package: "capacitor")])
    ]`;

    const after = rewrite(before);

    expect(after).toContain(rendered);
    expect(after).toContain('.product(name: "Capacitor", package: "capacitor")');
  });

  it('repoints a path left behind by an earlier sync', () => {
    expect(rewrite('.package(name: "capacitor", path: "../../../somewhere/else")')).toBe(rendered);
  });

  it('leaves a similarly named plugin package alone', () => {
    const before = '.package(name: "capacitor-plugin-foo", path: "../foo")';

    expect(rewrite(before)).toBe(before);
  });

  it('leaves unrelated dependencies alone', () => {
    const before = `.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/other/thing.git", from: "1.0.0")`;

    expect(rewrite(before)).toContain('.package(url: "https://github.com/other/thing.git", from: "1.0.0")');
  });

  it('handles a nested requirement without truncating the call', () => {
    const before = `.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", .upToNextMajor(from: "8.0.0"))`;

    expect(rewrite(before)).toBe(rendered);
  });

  it('is idempotent once already repointed', () => {
    const once = rewrite('.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")');

    expect(rewrite(once)).toBe(once);
  });

  it('collapses a manifest declaring both the prebuilt and source packages', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")
    ]`;

    const after = rewrite(before);

    expect(occurrences(after, '.package(')).toBe(1);
    expect(after).toBe(`dependencies: [
        ${rendered}
    ]`);
  });

  it('keeps the first entry when the source package is declared first', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor", from: "9.0.0"),
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ]`;

    const after = rewrite(before);

    expect(occurrences(after, '.package(')).toBe(1);
    expect(after).toBe(`dependencies: [
        ${rendered}
    ]`);
  });

  it('collapses three references down to one, preserving unrelated entries', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/other/thing.git", from: "1.0.0"),
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(path: "../capacitor-swift-pm"),
        .package(url: "https://github.com/ionic-team/capacitor", branch: "next")
    ]`;

    const after = rewrite(before);

    expect(occurrences(after, '.package(')).toBe(2);
    expect(after).toContain('.package(url: "https://github.com/other/thing.git", from: "1.0.0")');
    expect(occurrences(after, rendered)).toBe(1);
  });

  it('leaves no leading comma when the surviving entry is last', () => {
    const before = `dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/other/thing.git", from: "1.0.0")
    ]`;

    const after = rewrite(before);

    expect(after).not.toMatch(/\[\s*,/);
    expect(after).not.toMatch(/,\s*,/);
  });

  it('ignores a commented-out dependency rather than letting it win the collapse', () => {
    const before = `dependencies: [
        // .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main"),
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ]`;

    const after = rewrite(before);

    expect(after).toContain('// .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")');
    expect(after).toContain(rendered);
  });

  it('ignores a dependency inside a block comment', () => {
    const before = `/* .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0") */
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")`;

    const after = rewrite(before);

    expect(after).toContain(
      '/* .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0") */',
    );
    expect(after).toContain(rendered);
  });

  it('stays idempotent after collapsing', () => {
    const once = rewrite(`dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/ionic-team/capacitor", exact: "9.0.0")
    ]`);

    expect(rewrite(once)).toBe(once);
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

describe('patching a Package.swift deployment target', () => {
  it('bumps a symbolic deployment target (.v13) that is lower than required', () => {
    const result = patchPackageSwiftDeploymentTarget(`platforms: [.iOS(.v13)],`, '16');

    expect(result.changed).toBe(true);
    expect(result.previousVersion).toBe('13');
    expect(result.content).toBe(`platforms: [.iOS(.v16)],`);
  });

  it('bumps a string deployment target ("14.0") that is lower than required', () => {
    const result = patchPackageSwiftDeploymentTarget(`platforms: [.iOS("14.0")],`, '16');

    expect(result.changed).toBe(true);
    expect(result.previousVersion).toBe('14.0');
    expect(result.content).toBe(`platforms: [.iOS("16.0")],`);
  });

  it('does not patch a string deployment target that already satisfies the requirement', () => {
    const before = `platforms: [.iOS("16.0")],`;
    const result = patchPackageSwiftDeploymentTarget(before, '16');

    expect(result.changed).toBe(false);
    expect(result.previousVersion).toBe('16.0');
    expect(result.content).toBe(before);
  });

  it('does not lower a string deployment target that is higher than required', () => {
    const before = `platforms: [.iOS("17.0")],`;
    const result = patchPackageSwiftDeploymentTarget(before, '16');

    expect(result.changed).toBe(false);
    expect(result.previousVersion).toBe('17.0');
    expect(result.content).toBe(before);
  });

  it('does not patch when the deployment target already satisfies the requirement', () => {
    const before = `platforms: [.iOS(.v16)],`;
    const result = patchPackageSwiftDeploymentTarget(before, '16');

    expect(result.changed).toBe(false);
    expect(result.previousVersion).toBe('16');
    expect(result.content).toBe(before);
  });

  it('does not lower the deployment target when the plugin requires a higher one than Capacitor', () => {
    const before = `platforms: [.iOS(.v17)],`;
    const result = patchPackageSwiftDeploymentTarget(before, '16');

    expect(result.changed).toBe(false);
    expect(result.previousVersion).toBe('17');
    expect(result.content).toBe(before);
  });

  it('only patches the iOS entry in a multi-platform declaration', () => {
    const before = `platforms: [\n        .iOS(.v13),\n        .macCatalyst(.v13)\n    ],`;
    const result = patchPackageSwiftDeploymentTarget(before, '16');

    expect(result.changed).toBe(true);
    expect(result.content).toBe(`platforms: [\n        .iOS(.v16),\n        .macCatalyst(.v13)\n    ],`);
  });

  it('is a no-op when there is no .iOS(...) platform declaration', () => {
    const before = `platforms: [.macOS(.v11)],`;
    const result = patchPackageSwiftDeploymentTarget(before, '16');

    expect(result.changed).toBe(false);
    expect(result.previousVersion).toBeNull();
    expect(result.content).toBe(before);
  });

  it('derives the required major version dynamically from whatever is passed in', () => {
    const result = patchPackageSwiftDeploymentTarget(`platforms: [.iOS(.v15)],`, '17');

    expect(result.changed).toBe(true);
    expect(result.content).toBe(`platforms: [.iOS(.v17)],`);
  });
});
