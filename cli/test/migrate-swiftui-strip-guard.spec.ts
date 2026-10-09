import { existsSync, mkdirpSync, readFileSync, writeFileSync } from 'fs-extra';
import { join, resolve } from 'path';

import type { Config } from '../src/definitions';
import { migrateToSwiftUI } from '../src/tasks/migrate-swiftui';

import { mktmp } from './util';

const PRE_SWIFTUI_PBXPROJ = resolve(__dirname, 'fixtures/pre-swiftui-project.pbxproj');
const REPO_ROOT = resolve(__dirname, '..', '..');

let registrationThrows = false;

jest.mock('../src/util/xcode', () => {
  const actual = jest.requireActual('../src/util/xcode');
  return {
    ...actual,
    addSwiftFileToAppTarget: (...args: unknown[]) => {
      if (registrationThrows) {
        throw new Error('Could not find PBXGroup with comment "App"');
      }
      return (actual.addSwiftFileToAppTarget as (...a: unknown[]) => unknown)(...args);
    },
  };
});

// Stand in for the packed template tarballs so the test does not depend on `npm run assets`.
jest.mock('../src/util/template', () => ({
  extractTemplate: async (_archivePath: string, dir: string) => {
    const appDir = join(dir, 'App', 'App');
    mkdirpSync(appDir);
    for (const name of ['App.swift', 'AppDelegate.swift', 'CapacitorView.swift', 'SceneDelegate.swift']) {
      writeFileSync(join(appDir, name), templateSource(name));
    }
  },
}));

function templateSource(name: string): string {
  return readFileSync(resolve(REPO_ROOT, 'ios-spm-template/App/App', name), 'utf-8');
}

const INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>UILaunchStoryboardName</key>
  <string>LaunchScreen</string>
  <key>UIMainStoryboardFile</key>
  <string>Main</string>
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
        </dict>
      </array>
    </dict>
  </dict>
</dict>
</plist>
`;

const APP_DELEGATE_8_5 = `import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
`;

const SCENE_DELEGATE_8_5 = `import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }
}
`;

describe('migrateToSwiftUI strip guard', () => {
  let tmpDir: any;
  let targetDir: string;
  let pbxprojPath: string;
  let config: Config;

  beforeEach(async () => {
    registrationThrows = false;
    tmpDir = await mktmp();

    const platformDir = join(tmpDir.path, 'ios');
    const xcodeProjDir = join(platformDir, 'App', 'App.xcodeproj');
    targetDir = join(platformDir, 'App', 'App');
    pbxprojPath = join(xcodeProjDir, 'project.pbxproj');

    mkdirpSync(join(targetDir, 'Base.lproj'));
    mkdirpSync(xcodeProjDir);
    writeFileSync(pbxprojPath, readFileSync(PRE_SWIFTUI_PBXPROJ, 'utf-8'));
    writeFileSync(join(targetDir, 'Info.plist'), INFO_PLIST);
    writeFileSync(join(targetDir, 'AppDelegate.swift'), APP_DELEGATE_8_5);
    writeFileSync(join(targetDir, 'SceneDelegate.swift'), SCENE_DELEGATE_8_5);
    writeFileSync(join(targetDir, 'Base.lproj', 'Main.storyboard'), '<document/>\n');
    writeFileSync(join(targetDir, 'Base.lproj', 'LaunchScreen.storyboard'), '<document/>\n');

    config = {
      ios: {
        platformDirAbs: platformDir,
        nativeTargetDirAbs: targetDir,
        nativeXcodeProjDirAbs: xcodeProjDir,
        packageManager: 'SPM',
      },
      cli: { assetsDirAbs: join(tmpDir.path, 'assets') },
    } as unknown as Config;
    mkdirpSync(join(tmpDir.path, 'assets'));
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('strips the main storyboard when registration succeeds', async () => {
    await migrateToSwiftUI(config);

    expect(existsSync(join(targetDir, 'Base.lproj', 'Main.storyboard'))).toBe(false);
    expect(readFileSync(pbxprojPath, 'utf-8')).not.toContain('Main.storyboard');
  });

  it('replaces the stock 8.5 SceneDelegate with the 9.0 template and keeps it registered', async () => {
    await migrateToSwiftUI(config);

    expect(readFileSync(join(targetDir, 'SceneDelegate.swift'), 'utf-8')).toBe(templateSource('SceneDelegate.swift'));
    expect(readFileSync(pbxprojPath, 'utf-8')).toContain('SceneDelegate.swift');
  });

  it('gives the stock 8.5 AppDelegate the template version, which still names SceneDelegate', async () => {
    await migrateToSwiftUI(config);

    expect(readFileSync(join(targetDir, 'AppDelegate.swift'), 'utf-8')).toBe(templateSource('AppDelegate.swift'));
    expect(readFileSync(join(targetDir, 'AppDelegate.swift'), 'utf-8')).toContain(
      'configuration.delegateClass = SceneDelegate.self',
    );
  });

  it('keeps every UIKit file when the App target could not be updated', async () => {
    registrationThrows = true;

    await migrateToSwiftUI(config);

    expect(existsSync(join(targetDir, 'SceneDelegate.swift'))).toBe(true);
    expect(existsSync(join(targetDir, 'Base.lproj', 'Main.storyboard'))).toBe(true);

    const pbxproj = readFileSync(pbxprojPath, 'utf-8');
    expect(pbxproj).toContain('SceneDelegate.swift');
    expect(pbxproj).toContain('Main.storyboard');
  });

  it('keeps every UIKit file when the AppDelegate conversion is refused', async () => {
    writeFileSync(
      join(targetDir, 'AppDelegate.swift'),
      APP_DELEGATE_8_5.replace(
        '        return true',
        '        window = UIWindow(frame: UIScreen.main.bounds)\n        return true',
      ),
    );

    await migrateToSwiftUI(config);

    expect(existsSync(join(targetDir, 'SceneDelegate.swift'))).toBe(true);
    expect(existsSync(join(targetDir, 'Base.lproj', 'Main.storyboard'))).toBe(true);
    expect(readFileSync(pbxprojPath, 'utf-8')).toContain('SceneDelegate.swift');
  });
});
