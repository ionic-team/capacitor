import { readFileSync, writeFileSync } from 'fs-extra';
import { join } from 'path';
import type { PlistObject } from 'plist';
import { parse } from 'plist';

import type { Config } from '../src/definitions';
import { hasSceneManifest, hasSwiftUISceneManifest, setSwiftUISceneManifest } from '../src/util/spm';

import { mktmp } from './util';

const INFO_PLIST_8_4 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>My App</string>
  <key>UILaunchStoryboardName</key>
  <string>LaunchScreen</string>
  <key>UIMainStoryboardFile</key>
  <string>Main</string>
</dict>
</plist>
`;

const INFO_PLIST_8_5 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>My App</string>
  <key>UIApplicationSceneManifest</key>
  <dict>
    <key>UIApplicationSupportsMultipleScenes</key>
    <false/>
    <key>UISceneConfigurations</key>
    <dict>
      <key>UIWindowSceneSessionRoleApplication</key>
      <array>
        <dict>
          <key>UISceneConfigurationName</key>
          <string>Default Configuration</string>
          <key>UISceneDelegateClassName</key>
          <string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
          <key>UISceneStoryboardFile</key>
          <string>Main</string>
        </dict>
      </array>
    </dict>
  </dict>
</dict>
</plist>
`;

const INFO_PLIST_CUSTOM_SCENE_DELEGATE = INFO_PLIST_8_5.replace(
  '$(PRODUCT_MODULE_NAME).SceneDelegate',
  '$(PRODUCT_MODULE_NAME).CustomSceneDelegate',
);

const INFO_PLIST_9_0 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>My App</string>
  <key>UIApplicationSceneManifest</key>
  <dict>
    <key>UIApplicationSupportsMultipleScenes</key>
    <false/>
  </dict>
</dict>
</plist>
`;

function makeFakeConfig(nativeTargetDirAbs: string): Config {
  return { ios: { nativeTargetDirAbs } } as unknown as Config;
}

function readManifest(plistPath: string): PlistObject {
  const parsed = parse(readFileSync(plistPath, 'utf-8')) as PlistObject;
  return parsed['UIApplicationSceneManifest'] as PlistObject;
}

describe('setSwiftUISceneManifest', () => {
  let tmpDir: any;
  let plistPath: string;
  let config: Config;

  beforeEach(async () => {
    tmpDir = await mktmp();
    plistPath = join(tmpDir.path, 'Info.plist');
    config = makeFakeConfig(tmpDir.path);
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('adds a SwiftUI-shaped manifest when none exists', async () => {
    writeFileSync(plistPath, INFO_PLIST_8_4);

    const result = await setSwiftUISceneManifest(config);

    expect(result.status).toBe('written');
    const manifest = readManifest(plistPath);
    expect(manifest['UIApplicationSupportsMultipleScenes']).toBe(false);
    expect(manifest['UISceneConfigurations']).toBeUndefined();
  });

  it('drops UIMainStoryboardFile', async () => {
    writeFileSync(plistPath, INFO_PLIST_8_4);

    await setSwiftUISceneManifest(config);

    const parsed = parse(readFileSync(plistPath, 'utf-8')) as PlistObject;
    expect(parsed['UIMainStoryboardFile']).toBeUndefined();
  });

  it('preserves sibling keys', async () => {
    writeFileSync(plistPath, INFO_PLIST_8_4);

    await setSwiftUISceneManifest(config);

    const parsed = parse(readFileSync(plistPath, 'utf-8')) as PlistObject;
    expect(parsed['CFBundleDisplayName']).toBe('My App');
    expect(parsed['UILaunchStoryboardName']).toBe('LaunchScreen');
  });

  it('rewrites an 8.5 manifest by dropping UISceneConfigurations', async () => {
    writeFileSync(plistPath, INFO_PLIST_8_5);

    const result = await setSwiftUISceneManifest(config);

    expect(result.status).toBe('written');
    const manifest = readManifest(plistPath);
    expect(manifest['UISceneConfigurations']).toBeUndefined();
    expect(manifest['UIApplicationSupportsMultipleScenes']).toBe(false);
  });

  it('preserves UIApplicationSupportsMultipleScenes when the project opted in', async () => {
    writeFileSync(plistPath, INFO_PLIST_8_5.replace('<false/>', '<true/>'));

    await setSwiftUISceneManifest(config);

    expect(readManifest(plistPath)['UIApplicationSupportsMultipleScenes']).toBe(true);
  });

  it('refuses to touch a manifest naming a custom scene delegate', async () => {
    writeFileSync(plistPath, INFO_PLIST_CUSTOM_SCENE_DELEGATE);
    const before = readFileSync(plistPath, 'utf-8');

    const result = await setSwiftUISceneManifest(config);

    expect(result.status).toBe('skipped');
    expect(result.status === 'skipped' && result.reason).toContain('CustomSceneDelegate');
    expect(readFileSync(plistPath, 'utf-8')).toBe(before);
  });

  it('reports unchanged for an already-migrated plist', async () => {
    writeFileSync(plistPath, INFO_PLIST_9_0);
    const before = readFileSync(plistPath, 'utf-8');

    const result = await setSwiftUISceneManifest(config);

    expect(result.status).toBe('unchanged');
    expect(readFileSync(plistPath, 'utf-8')).toBe(before);
  });

  it('is idempotent across repeated runs', async () => {
    writeFileSync(plistPath, INFO_PLIST_8_4);

    await setSwiftUISceneManifest(config);
    const firstOutput = readFileSync(plistPath, 'utf-8');
    await setSwiftUISceneManifest(config);
    const secondOutput = readFileSync(plistPath, 'utf-8');

    expect(secondOutput).toBe(firstOutput);
  });

  it('skips when the plist does not exist', async () => {
    const result = await setSwiftUISceneManifest(config);

    expect(result.status).toBe('skipped');
    expect(result.status === 'skipped' && result.reason).toContain('not found');
  });
});

describe('hasSceneManifest', () => {
  let tmpDir: any;
  let plistPath: string;
  let config: Config;

  beforeEach(async () => {
    tmpDir = await mktmp();
    plistPath = join(tmpDir.path, 'Info.plist');
    config = makeFakeConfig(tmpDir.path);
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('returns false when the manifest key is absent', () => {
    writeFileSync(plistPath, INFO_PLIST_8_4);
    expect(hasSceneManifest(config)).toBe(false);
  });

  it('returns true when the manifest key is present', () => {
    writeFileSync(plistPath, INFO_PLIST_8_5);
    expect(hasSceneManifest(config)).toBe(true);
  });

  it('returns false when the plist does not exist', () => {
    expect(hasSceneManifest(config)).toBe(false);
  });
});

describe('hasSwiftUISceneManifest', () => {
  let tmpDir: any;
  let plistPath: string;
  let config: Config;

  beforeEach(async () => {
    tmpDir = await mktmp();
    plistPath = join(tmpDir.path, 'Info.plist');
    config = makeFakeConfig(tmpDir.path);
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('returns false for an 8.4 plist with no manifest', () => {
    writeFileSync(plistPath, INFO_PLIST_8_4);
    expect(hasSwiftUISceneManifest(config)).toBe(false);
  });

  it('returns false for an 8.5 manifest with UISceneConfigurations', () => {
    writeFileSync(plistPath, INFO_PLIST_8_5);
    expect(hasSwiftUISceneManifest(config)).toBe(false);
  });

  it('returns true for a manifest without UISceneConfigurations', () => {
    writeFileSync(plistPath, INFO_PLIST_9_0);
    expect(hasSwiftUISceneManifest(config)).toBe(true);
  });

  it('returns false when the plist does not exist', () => {
    expect(hasSwiftUISceneManifest(config)).toBe(false);
  });
});
