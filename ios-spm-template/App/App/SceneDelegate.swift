import UIKit

/// Adopts the UIWindowScene-based life cycle required by newer iOS SDKs (see the
/// `UIApplicationSceneManifest` entry in Info.plist). Without this class and the
/// corresponding manifest entry, apps built with a scene-lifecycle-requiring SDK
/// fail to launch (UIKit logs "UIScene life cycle is required for apps built with
/// this SDK") even though no crash log is produced.
///
/// See: https://developer.apple.com/documentation/technotes/tn3187-migrating-to-the-uikit-scene-based-life-cycle
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // The root view controller (CAPBridgeViewController, via Main.storyboard) is configured
        // automatically from UISceneStoryboardFile in Info.plist, so no manual window/root view
        // controller setup is required here.
        guard scene is UIWindowScene else { return }
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // Called as the scene is being released by the system.
        // This occurs shortly after the scene enters the background, or when its session is discarded.
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Called when the scene has moved from an inactive state to an active state.
        // Use this method to restart any tasks that were paused (or not yet started) when the scene was inactive.
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // Called when the scene will move from an active state to an inactive state.
        // This may occur due to temporary interruptions (ex. an incoming phone call).
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Called as the scene transitions from the background to the foreground.
        // Use this method to undo the changes made on entering the background.
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Called as the scene transitions from the foreground to the background.
        // Use this method to save data, release shared resources, and store enough scene-specific
        // state information to restore the scene back to its current state.
    }
}
