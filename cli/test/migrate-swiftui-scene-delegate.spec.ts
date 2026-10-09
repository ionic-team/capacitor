import { existsSync, mkdirpSync, readFileSync, writeFileSync } from 'fs-extra';
import { join, resolve } from 'path';

import type { Config } from '../src/definitions';
import { __testables } from '../src/tasks/migrate-swiftui';

import { mktmp } from './util';

const { isStockSceneDelegate, removeLeftoverStoryboard, writeSceneDelegate } = __testables;

const PRE_SWIFTUI_PBXPROJ = resolve(__dirname, 'fixtures/pre-swiftui-project.pbxproj');
const TEMPLATE = readFileSync(resolve(__dirname, '../../ios-spm-template/App/App/SceneDelegate.swift'), 'utf-8');

const STOCK = `import UIKit
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

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
`;

describe('isStockSceneDelegate', () => {
  it('accepts the 8.x template verbatim', () => {
    expect(isStockSceneDelegate(STOCK)).toBe(true);
  });

  it('accepts a template annotated with comments', () => {
    const commented = STOCK.replace('var window: UIWindow?', '// the app window\n    var window: UIWindow?');

    expect(isStockSceneDelegate(commented)).toBe(true);
  });

  it('rejects an extra stored property', () => {
    const customised = STOCK.replace('var window: UIWindow?', 'var window: UIWindow?\n    var deepLink: URL?');

    expect(isStockSceneDelegate(customised)).toBe(false);
  });

  it('rejects an extra method', () => {
    const customised = STOCK.replace(
      '    }\n}\n',
      '    }\n\n    func sceneDidBecomeActive(_ scene: UIScene) {\n        Analytics.track("foreground")\n    }\n}\n',
    );

    expect(isStockSceneDelegate(customised)).toBe(false);
  });

  it('rejects an extra statement inside willConnectTo', () => {
    const customised = STOCK.replace(
      'window?.makeKeyAndVisible()',
      'window?.makeKeyAndVisible()\n        window?.tintColor = .systemPink',
    );

    expect(isStockSceneDelegate(customised)).toBe(false);
  });

  it('rejects a custom root view controller', () => {
    const customised = STOCK.replace('CAPBridgeViewController()', 'MyBridgeViewController()');

    expect(isStockSceneDelegate(customised)).toBe(false);
  });

  it('rejects a non-proxy openURLContexts body', () => {
    const customised = STOCK.replace(
      'SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)',
      'Router.handle(URLContexts)',
    );

    expect(isStockSceneDelegate(customised)).toBe(false);
  });

  it('rejects a non-proxy continue body', () => {
    const customised = STOCK.replace(
      'SceneDelegateProxy.shared.scene(scene, continue: userActivity)',
      'Router.handle(userActivity)',
    );

    expect(isStockSceneDelegate(customised)).toBe(false);
  });

  it('rejects a file with no SceneDelegate class', () => {
    expect(isStockSceneDelegate('import UIKit\n')).toBe(false);
  });
});

describe('writeSceneDelegate', () => {
  let tmpDir: any;
  let path: string;

  beforeEach(async () => {
    tmpDir = await mktmp();
    path = join(tmpDir.path, 'SceneDelegate.swift');
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('writes the template when no SceneDelegate exists', () => {
    expect(writeSceneDelegate(path, TEMPLATE)).toBe('written');
    expect(readFileSync(path, 'utf-8')).toBe(TEMPLATE);
  });

  it('replaces a stock 8.x SceneDelegate, whose window setup the App struct now owns', () => {
    writeFileSync(path, STOCK);

    expect(writeSceneDelegate(path, TEMPLATE)).toBe('replaced');
    expect(readFileSync(path, 'utf-8')).toBe(TEMPLATE);
  });

  it('keeps a customised SceneDelegate untouched', () => {
    const customised = STOCK.replace('var window: UIWindow?', 'var deepLink: URL?');
    writeFileSync(path, customised);

    expect(writeSceneDelegate(path, TEMPLATE)).toBe('kept');
    expect(readFileSync(path, 'utf-8')).toBe(customised);
  });

  it('is idempotent — the written template is itself stock', () => {
    writeSceneDelegate(path, TEMPLATE);

    expect(writeSceneDelegate(path, TEMPLATE)).toBe('replaced');
    expect(readFileSync(path, 'utf-8')).toBe(TEMPLATE);
  });
});

describe('removeLeftoverStoryboard', () => {
  let tmpDir: any;
  let config: Config;
  let targetDir: string;
  let pbxprojPath: string;

  beforeEach(async () => {
    tmpDir = await mktmp();
    targetDir = join(tmpDir.path, 'App', 'App');
    const xcodeProjDir = join(tmpDir.path, 'App', 'App.xcodeproj');
    pbxprojPath = join(xcodeProjDir, 'project.pbxproj');

    mkdirpSync(join(targetDir, 'Base.lproj'));
    mkdirpSync(xcodeProjDir);
    writeFileSync(pbxprojPath, readFileSync(PRE_SWIFTUI_PBXPROJ, 'utf-8'));
    writeFileSync(join(targetDir, 'SceneDelegate.swift'), STOCK);
    writeFileSync(join(targetDir, 'Base.lproj', 'Main.storyboard'), '<document/>\n');
    writeFileSync(join(targetDir, 'Base.lproj', 'LaunchScreen.storyboard'), '<document/>\n');

    config = {
      ios: { nativeTargetDirAbs: targetDir, nativeXcodeProjDirAbs: xcodeProjDir },
    } as unknown as Config;
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('removes Main.storyboard from disk and from the pbxproj', () => {
    removeLeftoverStoryboard(config);

    expect(existsSync(join(targetDir, 'Base.lproj', 'Main.storyboard'))).toBe(false);
    expect(readFileSync(pbxprojPath, 'utf-8')).not.toContain('Main.storyboard');
  });

  it('leaves SceneDelegate.swift on disk and registered, because it is the live scene delegate', () => {
    removeLeftoverStoryboard(config);

    expect(existsSync(join(targetDir, 'SceneDelegate.swift'))).toBe(true);
    expect(readFileSync(pbxprojPath, 'utf-8')).toContain('SceneDelegate.swift');
  });

  it('keeps LaunchScreen.storyboard on disk and registered', () => {
    removeLeftoverStoryboard(config);

    expect(existsSync(join(targetDir, 'Base.lproj', 'LaunchScreen.storyboard'))).toBe(true);
    expect(readFileSync(pbxprojPath, 'utf-8')).toContain('LaunchScreen.storyboard');
  });

  it('makes no further changes on a second run', () => {
    removeLeftoverStoryboard(config);
    const after = readFileSync(pbxprojPath, 'utf-8');

    removeLeftoverStoryboard(config);

    expect(readFileSync(pbxprojPath, 'utf-8')).toBe(after);
  });
});
