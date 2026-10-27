import Foundation

@objc(CAPApplicationDelegateProxy)
public class ApplicationDelegateProxy: NSObject, UIApplicationDelegate {
    public static let shared = ApplicationDelegateProxy()

    public internal(set) var lastURL: URL?

    public func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        NotificationCenter.default.post(name: .capacitorOpenURL, object: [
            "url": url,
            "options": options
        ])
        lastURL = url
        return true
    }

    public func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // TODO: Support other types, emit to rest of plugins
        if userActivity.activityType != NSUserActivityTypeBrowsingWeb || userActivity.webpageURL == nil {
            return false
        }

        let url = userActivity.webpageURL
        lastURL = url
        NotificationCenter.default.post(name: .capacitorOpenUniversalLink, object: [
            "url": url
        ])
        return true
    }

    /// The orientations the window's `CAPBridgeViewController` allows, including a `ScreenOrientation.lock()`.
    ///
    /// With the SwiftUI template the bridge is a child of the window's root view controller, so UIKit never asks it
    /// for `supportedInterfaceOrientations`. Forward `application(_:supportedInterfaceOrientationsFor:)` from the
    /// app delegate here so that the bridge's orientations still apply.
    public func application(
        _ application: UIApplication,
        supportedInterfaceOrientationsFor window: UIWindow?
    ) -> UIInterfaceOrientationMask {
        Self.supportedInterfaceOrientations(for: window)
    }

    static func supportedInterfaceOrientations(for window: UIWindow?) -> UIInterfaceOrientationMask {
        // A full-screen presentation decides its own orientations, as it does when the bridge is the root view
        // controller. Returning the bridge's here could leave UIKit with no orientation in common, which crashes.
        guard let rootViewController = window?.rootViewController,
              !isCoveredByFullScreenPresentation(rootViewController),
              let bridgeViewController = bridgeViewController(in: rootViewController)
        else { return infoPlistInterfaceOrientations }
        return bridgeViewController.supportedInterfaceOrientations
    }

    private static func isCoveredByFullScreenPresentation(_ viewController: UIViewController) -> Bool {
        var presented = viewController.presentedViewController
        while let current = presented {
            if [.fullScreen, .overFullScreen].contains(current.modalPresentationStyle) {
                return true
            }
            presented = current.presentedViewController
        }
        return false
    }

    private static func bridgeViewController(in viewController: UIViewController) -> CAPBridgeViewController? {
        if let bridgeViewController = viewController as? CAPBridgeViewController {
            return bridgeViewController
        }
        return viewController.children.lazy.compactMap { bridgeViewController(in: $0) }.first
    }

    /// The orientations declared in Info.plist, which UIKit uses when the app delegate doesn't answer.
    static var infoPlistInterfaceOrientations: UIInterfaceOrientationMask {
        let info = Bundle.main.infoDictionary
        let iPadNames = UIDevice.current.userInterfaceIdiom == .pad
            ? info?["UISupportedInterfaceOrientations~ipad"] as? [String] : nil
        let names = iPadNames ?? info?["UISupportedInterfaceOrientations"] as? [String] ?? []
        let mask = names.reduce(into: UIInterfaceOrientationMask()) { mask, name in
            switch name {
            case "UIInterfaceOrientationPortrait": mask.insert(.portrait)
            case "UIInterfaceOrientationPortraitUpsideDown": mask.insert(.portraitUpsideDown)
            case "UIInterfaceOrientationLandscapeLeft": mask.insert(.landscapeLeft)
            case "UIInterfaceOrientationLandscapeRight": mask.insert(.landscapeRight)
            default: break
            }
        }
        return mask.isEmpty ? .all : mask
    }
}
