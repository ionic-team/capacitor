import { mkdirp, readFile, writeFile } from 'fs-extra';
import { join } from 'path';

import { loadConfig } from '../src/config';
import type { Config } from '../src/definitions';
import { updateIOS } from '../src/ios/update';
import { logger } from '../src/log';
import type { Plugin } from '../src/plugin';
import { generateCordovaPackageFile } from '../src/util/cordova-ios';

import { mktmp } from './util';

const CAPACITOR_PACKAGE_SWIFT = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Capacitor",
    platforms: [.iOS(.v16)],
    products: [.library(name: "Capacitor", targets: ["Capacitor"])],
    targets: [.target(name: "Capacitor")]
)
`;

function pluginPackageSwift(platform: string): string {
  return `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorApp",
    platforms: [${platform}],
    products: [.library(name: "CapacitorApp", targets: ["AppPlugin"])],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "9.0.0")
    ],
    targets: [
        .target(
            name: "AppPlugin",
            dependencies: [.product(name: "Capacitor", package: "capacitor-swift-pm")]
        )
    ]
)
`;
}

async function writeJSON(path: string, data: unknown): Promise<void> {
  await mkdirp(join(path, '..'));
  await writeFile(path, JSON.stringify(data, null, 2));
}

async function makeSpmApp(
  root: string,
  deploymentTarget: string,
  plugins: Record<string, string>,
): Promise<Record<string, string>> {
  await writeJSON(join(root, 'package.json'), {
    name: 'app',
    version: '1.0.0',
    dependencies: {
      '@capacitor/core': '9.0.0',
      '@capacitor/ios': '9.0.0',
      ...Object.fromEntries(Object.keys(plugins).map((name) => [`@capacitor/${name}`, '9.0.0'])),
    },
  });
  await writeJSON(join(root, 'capacitor.config.json'), { appId: 'com.example.app', appName: 'App', webDir: 'www' });
  await mkdirp(join(root, 'www'));
  await writeFile(join(root, 'www', 'index.html'), '<html></html>');

  await writeJSON(join(root, 'node_modules/@capacitor/core/package.json'), {
    name: '@capacitor/core',
    version: '9.0.0',
  });
  await writeJSON(join(root, 'node_modules/@capacitor/ios/package.json'), { name: '@capacitor/ios', version: '9.0.0' });
  await writeFile(join(root, 'node_modules/@capacitor/ios/Package.swift'), CAPACITOR_PACKAGE_SWIFT);

  const manifests: Record<string, string> = {};
  for (const [name, platform] of Object.entries(plugins)) {
    const dir = join(root, 'node_modules/@capacitor', name);
    await writeJSON(join(dir, 'package.json'), {
      name: `@capacitor/${name}`,
      version: '9.0.0',
      capacitor: { ios: { src: 'ios' } },
    });
    await mkdirp(join(dir, 'ios', 'Sources'));
    await writeFile(join(dir, 'ios', 'Sources', 'Plugin.swift'), 'import Capacitor\n');
    manifests[name] = join(dir, 'Package.swift');
    await writeFile(manifests[name], pluginPackageSwift(platform));
  }

  const native = join(root, 'ios', 'App');
  await mkdirp(join(native, 'App.xcodeproj'));
  await mkdirp(join(native, 'CapApp-SPM'));
  await mkdirp(join(native, 'App', 'public'));
  await writeFile(
    join(native, 'App.xcodeproj', 'project.pbxproj'),
    `buildSettings = {\n\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = ${deploymentTarget};\n\t\t\t};\n`,
  );
  await writeFile(join(native, 'CapApp-SPM', 'Package.swift'), '');
  await writeFile(join(native, 'App', 'public', 'index.html'), '');
  await writeFile(join(native, 'App', 'capacitor.config.json'), '{}');
  return manifests;
}

async function loadAppConfig(root: string): Promise<Config> {
  const cwd = process.cwd();
  process.chdir(root);
  try {
    return await loadConfig();
  } finally {
    process.chdir(cwd);
  }
}

describe('Update: iOS SPM plugin deployment target', () => {
  let tmpDir: any;

  beforeEach(async () => {
    jest.spyOn(logger, 'info').mockImplementation(() => undefined);
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    tmpDir = await mktmp();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tmpDir.cleanupCallback();
  });

  it('raises a plugin to the Capacitor minimum, not to the app deployment target', async () => {
    const manifests = await makeSpmApp(tmpDir.path, '18.0', { app: '.iOS(.v15)' });

    await updateIOS(await loadAppConfig(tmpDir.path), false);

    const content = await readFile(manifests.app, 'utf-8');
    expect(content).toContain('platforms: [.iOS(.v16)]');
    expect(content).not.toContain('.v18');
  });

  it('repoints a Cordova plugin that ships its own Package.swift at the installed Capacitor package', async () => {
    await makeSpmApp(tmpDir.path, '16.0', {});
    const config = await loadAppConfig(tmpDir.path);
    const rootPath = join(tmpDir.path, 'node_modules', 'cordova-plugin-foo');
    await mkdirp(rootPath);
    await writeFile(
      join(rootPath, 'Package.swift'),
      `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "cordova-plugin-foo",
    platforms: [.iOS(.v13)],
    products: [.library(name: "cordova-plugin-foo", targets: ["CDVFoo"])],
    dependencies: [
        .package(url: "https://github.com/apache/cordova-ios.git", branch: "master")
    ],
    targets: [
        .target(
            name: "CDVFoo",
            dependencies: [.product(name: "Cordova", package: "cordova-ios")],
            path: "src/ios"
        )
    ]
)
`,
    );
    const plugin = {
      id: 'cordova-plugin-foo',
      name: 'cordova-plugin-foo',
      version: '1.0.0',
      rootPath,
      xml: { platform: [{ $: { name: 'ios', package: 'swift' } }] },
    } as unknown as Plugin;

    await generateCordovaPackageFile(plugin, config);

    const content = await readFile(join(rootPath, 'Package.swift'), 'utf-8');
    expect(content).toContain('.package(name: "capacitor-ios", path: "../@capacitor/ios")');
    expect(content).toContain('.product(name: "Cordova", package: "capacitor-ios")');
    expect(content).not.toContain('cordova-ios');
    expect(content).not.toContain('github.com');
    expect(content).toContain('platforms: [.iOS(.v16)]');
  });

  it('leaves a plugin that already declares a target at or above the Capacitor minimum alone', async () => {
    const manifests = await makeSpmApp(tmpDir.path, '18.0', { app: '.iOS(.v17)' });

    await updateIOS(await loadAppConfig(tmpDir.path), false);

    expect(await readFile(manifests.app, 'utf-8')).toContain('platforms: [.iOS(.v17)]');
  });
});

describe('Cordova plugin Package.swift generated for SPM', () => {
  let tmpDir: any;

  beforeEach(async () => {
    jest.spyOn(logger, 'info').mockImplementation(() => undefined);
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    tmpDir = await mktmp();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tmpDir.cleanupCallback();
  });

  it('declares the Capacitor minimum, which the 5.9 tools version can express, not the app deployment target', async () => {
    await makeSpmApp(tmpDir.path, '18.0', {});
    const config = await loadAppConfig(tmpDir.path);
    const sourcesDir = join(config.ios.cordovaPluginsDirAbs, 'sources', 'cool-cordova-plugin');
    await mkdirp(sourcesDir);
    const plugin = {
      id: 'cool-cordova-plugin',
      name: 'cool-cordova-plugin',
      version: '1.0.0',
      rootPath: join(tmpDir.path, 'node_modules', 'cool-cordova-plugin'),
      xml: { platform: [{ $: { name: 'ios' }, 'source-file': [{ $: { src: 'src/ios/Cool.m' } }] }] },
    } as unknown as Plugin;

    await generateCordovaPackageFile(plugin, config);

    const content = await readFile(join(sourcesDir, 'Package.swift'), 'utf-8');
    expect(content).toContain('// swift-tools-version: 5.9');
    expect(content).toContain('platforms: [.iOS(.v16)]');
    expect(content).not.toContain('.v18');
  });
});
