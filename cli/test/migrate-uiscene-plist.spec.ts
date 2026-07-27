import { readFileSync, writeFileSync } from 'fs-extra';
import { join } from 'path';
import type { PlistObject } from 'plist';
import { parse } from 'plist';

import { addSceneManifest, hasSceneManifest } from '../src/util/spm';

import { mktmp } from './util';

const PRE_UISCENE_INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
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

const POST_UISCENE_INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
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
          <string>Existing Configuration</string>
          <key>UISceneDelegateClassName</key>
          <string>$(PRODUCT_MODULE_NAME).CustomSceneDelegate</string>
        </dict>
      </array>
    </dict>
  </dict>
</dict>
</plist>
`;

describe('addSceneManifest', () => {
  let tmpDir: any;
  let plistPath: string;

  beforeEach(async () => {
    tmpDir = await mktmp();
    plistPath = join(tmpDir.path, 'Info.plist');
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('adds the scene manifest when absent', () => {
    writeFileSync(plistPath, PRE_UISCENE_INFO_PLIST);

    const result = addSceneManifest(plistPath);

    expect(result.added).toBe(true);
    const parsed = parse(readFileSync(plistPath, 'utf-8')) as PlistObject;
    const manifest = parsed['UIApplicationSceneManifest'] as PlistObject;
    expect(manifest['UIApplicationSupportsMultipleScenes']).toBe(false);
    const configs = manifest['UISceneConfigurations'] as PlistObject;
    const roleArray = configs['UIWindowSceneSessionRoleApplication'] as PlistObject[];
    expect(roleArray).toHaveLength(1);
    expect(roleArray[0]['UISceneConfigurationName']).toBe('Default Configuration');
    expect(roleArray[0]['UISceneDelegateClassName']).toBe('$(PRODUCT_MODULE_NAME).SceneDelegate');
    expect(roleArray[0]['UISceneStoryboardFile']).toBe('Main');
  });

  it('preserves sibling keys', () => {
    writeFileSync(plistPath, PRE_UISCENE_INFO_PLIST);

    addSceneManifest(plistPath);

    const parsed = parse(readFileSync(plistPath, 'utf-8')) as PlistObject;
    expect(parsed['CFBundleDisplayName']).toBe('My App');
    expect(parsed['UILaunchStoryboardName']).toBe('LaunchScreen');
    expect(parsed['UIMainStoryboardFile']).toBe('Main');
  });

  it('is a no-op when the manifest already exists and does not overwrite user data', () => {
    writeFileSync(plistPath, POST_UISCENE_INFO_PLIST);

    const result = addSceneManifest(plistPath);

    expect(result.added).toBe(false);
    const parsed = parse(readFileSync(plistPath, 'utf-8')) as PlistObject;
    const manifest = parsed['UIApplicationSceneManifest'] as PlistObject;
    const configs = manifest['UISceneConfigurations'] as PlistObject;
    const roleArray = configs['UIWindowSceneSessionRoleApplication'] as PlistObject[];
    expect(roleArray[0]['UISceneConfigurationName']).toBe('Existing Configuration');
    expect(roleArray[0]['UISceneDelegateClassName']).toBe('$(PRODUCT_MODULE_NAME).CustomSceneDelegate');
  });

  it('is idempotent across repeated runs', () => {
    writeFileSync(plistPath, PRE_UISCENE_INFO_PLIST);

    expect(addSceneManifest(plistPath).added).toBe(true);
    expect(addSceneManifest(plistPath).added).toBe(false);
    expect(addSceneManifest(plistPath).added).toBe(false);
  });

  it('returns false when the plist does not exist', () => {
    const missing = join(tmpDir.path, 'DoesNotExist.plist');
    expect(addSceneManifest(missing).added).toBe(false);
  });
});

describe('hasSceneManifest', () => {
  let tmpDir: any;
  let plistPath: string;

  beforeEach(async () => {
    tmpDir = await mktmp();
    plistPath = join(tmpDir.path, 'Info.plist');
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('returns false when the manifest key is absent', () => {
    writeFileSync(plistPath, PRE_UISCENE_INFO_PLIST);
    expect(hasSceneManifest(plistPath)).toBe(false);
  });

  it('returns true when the manifest key is present', () => {
    writeFileSync(plistPath, POST_UISCENE_INFO_PLIST);
    expect(hasSceneManifest(plistPath)).toBe(true);
  });

  it('returns false when the plist does not exist', () => {
    expect(hasSceneManifest(join(tmpDir.path, 'DoesNotExist.plist'))).toBe(false);
  });
});
