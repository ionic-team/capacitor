import { __testables } from '../src/tasks/migrate-uiscene';

const { rewriteAppDelegateForAdaptor, hasCustomWindowSetup } = __testables;

// The AppDelegate shipped by the 8.4 templates: @main, UIResponder, own window.
const APP_DELEGATE_8_4 = `import UIKit
import Capacitor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
}
`;

// The AppDelegate shipped by the 8.5 templates: same, plus configurationForConnecting.
const APP_DELEGATE_8_5 = `import UIKit
import Capacitor

@main
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

function rewrite(source: string): string {
  const result = rewriteAppDelegateForAdaptor(source);
  if (result.status !== 'rewritten') {
    throw new Error(`expected a rewrite, got: ${result.reason}`);
  }
  return result.source;
}

describe('rewriteAppDelegateForAdaptor', () => {
  it('converts the 8.4 AppDelegate into adaptor shape', () => {
    const patched = rewrite(APP_DELEGATE_8_4);

    expect(patched).not.toContain('@main');
    expect(patched).toContain('class AppDelegate: NSObject, UIApplicationDelegate {');
    expect(patched).not.toContain('var window: UIWindow?');
    expect(patched).toContain('didFinishLaunchingWithOptions');
  });

  it('converts an @UIApplicationMain AppDelegate too', () => {
    const patched = rewrite(APP_DELEGATE_8_4.replace('@main', '@UIApplicationMain'));

    expect(patched).not.toContain('@UIApplicationMain');
    expect(patched).toContain('class AppDelegate: NSObject, UIApplicationDelegate {');
  });

  it('strips a @main written on the class declaration line', () => {
    const patched = rewrite(APP_DELEGATE_8_4.replace('@main\nclass', '@main class'));

    expect(patched).not.toContain('@main');
    expect(patched).toContain('class AppDelegate: NSObject, UIApplicationDelegate {');
  });

  it('removes configurationForConnecting from the 8.5 AppDelegate', () => {
    const patched = rewrite(APP_DELEGATE_8_5);

    expect(patched).not.toContain('configurationForConnecting');
    expect(patched).not.toContain('UISceneConfiguration');
    expect(patched).not.toContain('config.delegateClass');
    expect(patched).toContain('didFinishLaunchingWithOptions');
    expect(patched).not.toMatch(/\n\n\n/);
  });

  it('leaves the 8.5 AppDelegate closing the class cleanly', () => {
    const patched = rewrite(APP_DELEGATE_8_5);

    expect(patched).toBe(`import UIKit
import Capacitor

class AppDelegate: NSObject, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }
}
`);
  });

  it('is idempotent — a rewritten AppDelegate rewrites to itself', () => {
    const once = rewrite(APP_DELEGATE_8_5);

    expect(rewrite(once)).toBe(once);
  });

  it('keeps a vanilla application(_:open:) body', () => {
    const patched = rewrite(APP_DELEGATE_8_4);

    expect(patched).toContain('ApplicationDelegateProxy.shared.application(app, open: url, options: options)');
  });

  it('refuses when no AppDelegate class is present', () => {
    const result = rewriteAppDelegateForAdaptor('import UIKit\n\nstruct Something {}\n');

    expect(result.status).toBe('skipped');
    expect(result.status === 'skipped' && result.reason).toMatch(/no AppDelegate class/);
  });

  it('refuses when the AppDelegate sets up its own window', () => {
    const source = APP_DELEGATE_8_4.replace(
      '        return true',
      '        window = UIWindow(frame: UIScreen.main.bounds)\n        window?.makeKeyAndVisible()\n        return true',
    );

    const result = rewriteAppDelegateForAdaptor(source);

    expect(result.status).toBe('skipped');
    expect(result.status === 'skipped' && result.reason).toMatch(/UIWindow/);
  });

  it('refuses when application(_:open:) has a custom body', () => {
    const source = APP_DELEGATE_8_4.replace(
      '        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)',
      '        MyAnalytics.track(url)\n        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)',
    );

    const result = rewriteAppDelegateForAdaptor(source);

    expect(result.status).toBe('skipped');
    expect(result.status === 'skipped' && result.reason).toMatch(/application\(_:open:\)/);
  });

  it('refuses when application(_:continue:) has a custom body', () => {
    const source = `import UIKit
import Capacitor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        MyAnalytics.track(userActivity)
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
`;

    const result = rewriteAppDelegateForAdaptor(source);

    expect(result.status).toBe('skipped');
    expect(result.status === 'skipped' && result.reason).toMatch(/application\(_:continue:\)/);
  });

  it('refuses when configurationForConnecting braces are unbalanced', () => {
    const source = `class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
`;

    const result = rewriteAppDelegateForAdaptor(source);

    expect(result.status).toBe('skipped');
    expect(result.status === 'skipped' && result.reason).toMatch(/configurationForConnecting/);
  });
});

describe('hasCustomWindowSetup', () => {
  it('returns false for the bare template window property', () => {
    expect(hasCustomWindowSetup(APP_DELEGATE_8_4)).toBe(false);
  });

  it('returns false for an AppDelegate with no window at all', () => {
    expect(hasCustomWindowSetup('class AppDelegate: NSObject, UIApplicationDelegate {}\n')).toBe(false);
  });

  it('returns true when the window is assigned', () => {
    expect(hasCustomWindowSetup('    var window: UIWindow?\n    window = UIWindow()\n')).toBe(true);
  });

  it('returns true when a root view controller is installed', () => {
    expect(hasCustomWindowSetup('    window?.rootViewController = MyViewController()\n')).toBe(true);
  });

  it('ignores commented-out window code', () => {
    expect(hasCustomWindowSetup('    // window = UIWindow()\n    var window: UIWindow?\n')).toBe(false);
  });

  it('does not trip on UIWindowScene references', () => {
    expect(hasCustomWindowSetup('    let scene = connectingSceneSession as? UIWindowScene\n')).toBe(false);
  });
});
