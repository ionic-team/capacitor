import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'fs-extra';
import { join, resolve } from 'path';

import { installGradlePlugins } from '../src/android/update';
import type { Config } from '../src/definitions';
import { getPackageReferencePath, getPluginReferencePath, PluginType } from '../src/plugin';
import type { Plugin } from '../src/plugin';
import { generatePackageText } from '../src/util/spm';

import { mktmp } from './util';

/**
 * Fixture layout mimicking a package manager whose physical dependency
 * contents live outside the project (e.g. pnpm's global virtual store):
 *
 *   <tmp>/app/                          <- project root (rootDir)
 *     node_modules/@capacitor/app       -> ../../global-store/app
 *     node_modules/@capacitor/android   -> ../../global-store/android
 *     node_modules/@capacitor/ios       -> ../../global-store/ios
 *     android/, ios/App/...
 *   <tmp>/global-store/                 <- physical package locations
 *     app/, android/, ios/
 *
 * `resolvePlugin` reports rootPath as the resolved physical location
 * (require.resolve follows the symlinks), so the plugin's rootPath is
 * <tmp>/global-store/app. Generated native project files must reference
 * the stable project-local node_modules entries instead (see #8621).
 */
function makeFixture(tmpPath: string) {
  const appDir = join(tmpPath, 'app');
  const storeDir = join(tmpPath, 'global-store');
  const pluginDir = join(storeDir, 'app');
  const androidPkgDir = join(storeDir, 'android');
  const iosPkgDir = join(storeDir, 'ios');

  mkdirSync(join(appDir, 'node_modules', '@capacitor'), { recursive: true });
  mkdirSync(join(appDir, 'android', 'app'), { recursive: true });
  mkdirSync(join(appDir, 'ios', 'App', 'App.xcodeproj'), { recursive: true });
  mkdirSync(join(appDir, 'ios', 'App', 'CapApp-SPM'), { recursive: true });
  mkdirSync(join(pluginDir, 'android', 'src', 'main', 'com', 'example', 'app'), { recursive: true });
  mkdirSync(join(pluginDir, 'ios'), { recursive: true });
  mkdirSync(join(androidPkgDir, 'capacitor'), { recursive: true });
  mkdirSync(iosPkgDir, { recursive: true });

  symlinkSync(pluginDir, join(appDir, 'node_modules', '@capacitor', 'app'), 'dir');
  symlinkSync(androidPkgDir, join(appDir, 'node_modules', '@capacitor', 'android'), 'dir');
  symlinkSync(iosPkgDir, join(appDir, 'node_modules', '@capacitor', 'ios'), 'dir');

  writeFileSync(
    join(pluginDir, 'package.json'),
    JSON.stringify({
      name: '@capacitor/app',
      version: '8.1.2',
      capacitor: { android: { src: 'android' }, ios: { src: 'ios' } },
    }),
  );
  writeFileSync(
    join(pluginDir, 'android', 'src', 'main', 'com', 'example', 'app', 'AppPlugin.java'),
    `package com.example.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "App")
public class AppPlugin extends Plugin {
}
`,
  );
  writeFileSync(join(pluginDir, 'Package.swift'), '// swift-tools-version: 5.9\n');
  writeFileSync(join(androidPkgDir, 'package.json'), JSON.stringify({ name: '@capacitor/android', version: '8.6.0' }));
  writeFileSync(join(iosPkgDir, 'package.json'), JSON.stringify({ name: '@capacitor/ios', version: '8.6.0' }));
  writeFileSync(join(appDir, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj'), 'IPHONEOS_DEPLOYMENT_TARGET = 15;\n');

  const plugin: Plugin = {
    id: '@capacitor/app',
    name: 'CapacitorApp',
    version: '8.1.2',
    rootPath: pluginDir,
    manifest: { android: { src: 'android' }, ios: { src: 'ios' } },
    ios: { name: 'CapacitorApp', type: PluginType.Core, path: 'ios' },
    android: { type: PluginType.Core, path: 'android' },
  };

  const config = {
    app: { rootDir: appDir, extConfig: {} },
    android: {
      platformDirAbs: join(appDir, 'android'),
      appDirAbs: join(appDir, 'android', 'app'),
      assetsDirAbs: join(appDir, 'android', 'app', 'src', 'main', 'assets'),
      cordovaPluginsDirAbs: join(appDir, 'android', 'capacitor-cordova-android-plugins'),
    },
    ios: {
      name: 'ios',
      nativeXcodeProjDirAbs: join(appDir, 'ios', 'App', 'App.xcodeproj'),
      nativeProjectDirAbs: join(appDir, 'ios', 'App'),
    },
  } as unknown as Config;

  return { appDir, storeDir, pluginDir, plugin, config };
}

describe('plugin reference paths (#8621)', () => {
  let tmpDir: any;
  let fixture: ReturnType<typeof makeFixture>;

  beforeEach(async () => {
    tmpDir = await mktmp();
    fixture = makeFixture(tmpDir.path);
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  describe('getPackageReferencePath', () => {
    it('prefers the project-local node_modules entry when the package lives outside the project', () => {
      const { config, appDir, pluginDir } = fixture;
      expect(getPackageReferencePath(config, '@capacitor/app', pluginDir)).toBe(
        join(appDir, 'node_modules', '@capacitor', 'app'),
      );
    });

    it('keeps the resolved path when the package already lives inside the project', () => {
      const { config, appDir } = fixture;
      const insidePath = join(appDir, 'android');
      expect(getPackageReferencePath(config, '@capacitor/app', insidePath)).toBe(insidePath);
    });

    it('falls back to the resolved path when there is no project-local entry (e.g. hoisted monorepo deps)', () => {
      const { config, storeDir } = fixture;
      expect(getPackageReferencePath(config, '@capacitor/nonexistent', join(storeDir, 'app'))).toBe(
        join(storeDir, 'app'),
      );
    });

    it('falls back to the resolved path when the project-local entry is a dangling symlink', () => {
      const { config, appDir, storeDir } = fixture;
      symlinkSync(join(storeDir, 'missing'), join(appDir, 'node_modules', '@capacitor', 'dangling'), 'dir');
      expect(getPackageReferencePath(config, '@capacitor/dangling', join(storeDir, 'app'))).toBe(join(storeDir, 'app'));
    });
  });

  describe('getPluginReferencePath', () => {
    it('prefers the project-local node_modules entry for an externally stored plugin', () => {
      const { config, appDir, plugin } = fixture;
      expect(getPluginReferencePath(config, plugin)).toBe(join(appDir, 'node_modules', '@capacitor', 'app'));
    });
  });

  describe('generated native project files', () => {
    it('Android settings.gradle references the project-local plugin entry, and every path exists', async () => {
      const { config, plugin, appDir } = fixture;

      await installGradlePlugins(config, [plugin], []);

      const settings = readFileSync(join(appDir, 'android', 'capacitor.settings.gradle'), 'utf-8');
      expect(settings).toContain(
        `project(':capacitor-app').projectDir = new File('../node_modules/@capacitor/app/android')`,
      );
      expect(settings).toContain(
        `project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor')`,
      );
      expect(settings).not.toContain('global-store');

      for (const line of settings.split('\n')) {
        const match = line.match(/new File\('([^']+)'\)/);
        if (match) {
          expect(existsSync(resolve(join(appDir, 'android'), match[1]))).toBe(true);
        }
      }
    });

    it('iOS SPM Package.swift references the project-local plugin entry, and the path exists', async () => {
      const { config, plugin, appDir } = fixture;

      const text = await generatePackageText(config, [plugin]);

      expect(text).toContain(`.package(name: "CapacitorApp", path: "../../../node_modules/@capacitor/app")`);
      expect(text).not.toContain('global-store');

      for (const line of text.split('\n')) {
        const match = line.match(/\.package\(name: "[^"]+", path: "([^"]+)"\)/);
        if (match) {
          expect(existsSync(resolve(join(appDir, 'ios', 'App', 'CapApp-SPM'), match[1]))).toBe(true);
        }
      }
    });
  });
});
