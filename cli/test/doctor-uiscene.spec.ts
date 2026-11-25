import { mkdtempSync, rmSync, writeFileSync } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';

import type { Config } from '../src/definitions';
import { getUISceneDoctorWarning } from '../src/tasks/migrate-uiscene';

const plist = (body: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict>${body}</dict></plist>\n`;

describe('getUISceneDoctorWarning', () => {
  let dir: string;
  let config: Config;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'cap-doctor-uiscene-'));
    config = { ios: { nativeTargetDirAbs: dir } } as unknown as Config;
    writeFileSync(join(dir, 'Info.plist'), plist('<key>CFBundleName</key><string>App</string>'));
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('warns and points to cap migrate when nothing is migrated', () => {
    expect(getUISceneDoctorWarning(config)).toMatch(/has not adopted UIScene.*npx cap migrate/);
  });

  it('warns about a partial migration and lists what is missing', () => {
    writeFileSync(join(dir, 'SceneDelegate.swift'), 'class SceneDelegate {}');
    const warning = getUISceneDoctorWarning(config);
    expect(warning).toMatch(/only partly adopted UIScene/);
    expect(warning).toContain('missing: [UIApplicationSceneManifest, AppDelegate.configurationForConnecting]');
  });

  it('returns null when fully migrated', () => {
    writeFileSync(join(dir, 'Info.plist'), plist('<key>UIApplicationSceneManifest</key><dict/>'));
    writeFileSync(join(dir, 'SceneDelegate.swift'), 'class SceneDelegate {}');
    writeFileSync(
      join(dir, 'AppDelegate.swift'),
      'UISceneConfiguration(name: "Default Configuration", sessionRole: role)',
    );
    expect(getUISceneDoctorWarning(config)).toBeNull();
  });
});
