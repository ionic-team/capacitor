import { readFileSync } from 'fs-extra';
import { resolve } from 'path';

import { __testables } from '../src/tasks/migrate-swiftui';

const { isStockAppDelegate } = __testables;

const REPO_ROOT = resolve(__dirname, '..', '..');

// The AppDelegate shipped by the 8.x templates, verbatim: UIScene-era, with
// configurationForConnecting pointing at SceneDelegate.
const STOCK_8_X = `import UIKit
import Capacitor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate.
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

// The pre-UIScene shape a 6.x or 7.x app carries into a 9.0 migration: no
// configurationForConnecting, but open-URL and universal-link proxy handlers.
const STOCK_7_X = `import UIKit
import Capacitor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
`;

// The 6.x shape, before @UIApplicationMain was replaced with @main.
const STOCK_6_X = STOCK_7_X.replace('@main', '@UIApplicationMain');

describe('isStockAppDelegate', () => {
  it.each([['ios-spm-template/App/App/AppDelegate.swift'], ['ios-pods-template/App/App/AppDelegate.swift']])(
    'accepts the shipped 9.0 template at %s, so a second run is a no-op',
    (templatePath) => {
      expect(isStockAppDelegate(readFileSync(resolve(REPO_ROOT, templatePath), 'utf-8'))).toBe(true);
    },
  );

  it.each([
    ['8.x', STOCK_8_X],
    ['7.x', STOCK_7_X],
    ['6.x', STOCK_6_X],
  ])('accepts the stock %s AppDelegate', (_label, source) => {
    expect(isStockAppDelegate(source)).toBe(true);
  });

  it('rejects a body added to a lifecycle stub', () => {
    const customised = STOCK_8_X.replace(
      '        // Restart any tasks that were paused.',
      '        Analytics.track("foreground")',
    );

    expect(isStockAppDelegate(customised)).toBe(false);
  });

  it('rejects work added to didFinishLaunchingWithOptions', () => {
    const customised = STOCK_8_X.replace('        return true', '        FirebaseApp.configure()\n        return true');

    expect(isStockAppDelegate(customised)).toBe(false);
  });

  it('rejects a non-proxy open-URL handler', () => {
    const customised = STOCK_7_X.replace(
      'return ApplicationDelegateProxy.shared.application(app, open: url, options: options)',
      'return Router.handle(url)',
    );

    expect(isStockAppDelegate(customised)).toBe(false);
  });

  it('rejects an added method', () => {
    const customised = STOCK_8_X.replace(
      '    }\n}\n',
      '    }\n\n    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {\n        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)\n    }\n}\n',
    );

    expect(isStockAppDelegate(customised)).toBe(false);
  });

  it('rejects an added stored property', () => {
    const customised = STOCK_8_X.replace('var window: UIWindow?', 'var window: UIWindow?\n    var pendingURL: URL?');

    expect(isStockAppDelegate(customised)).toBe(false);
  });

  it('rejects an added import', () => {
    const customised = STOCK_8_X.replace('import Capacitor', 'import Capacitor\nimport FirebaseCore');

    expect(isStockAppDelegate(customised)).toBe(false);
  });

  it('rejects a delegate that conforms to an extra protocol', () => {
    const customised = STOCK_8_X.replace(
      'class AppDelegate: UIResponder, UIApplicationDelegate {',
      'class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate {',
    );

    expect(isStockAppDelegate(customised)).toBe(false);
  });

  it('rejects a file with no AppDelegate class', () => {
    expect(isStockAppDelegate('import UIKit\n')).toBe(false);
  });
});
