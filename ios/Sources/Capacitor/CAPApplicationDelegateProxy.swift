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
        // An empty mask comes from `ScreenOrientation.lock('any')`, which the bridge stores as `.unknown`.
        guard let rootViewController = window?.rootViewController,
              let mask = bridgeViewController(in: rootViewController)?.supportedInterfaceOrientations,
              !mask.isEmpty,
              !isDecidedByPresentation(over: rootViewController, sharingNothingWith: mask)
        else { return infoPlistInterfaceOrientations }
        return mask
    }

    private static func isDecidedByPresentation(
        over viewController: UIViewController,
        sharingNothingWith mask: UIInterfaceOrientationMask
    ) -> Bool {
        var presented = viewController.presentedViewController
        while let current = presented {
            // A full-screen presentation decides its own orientations, as it does when the bridge is the root view
            // controller. UIKit also asks `.custom` ones, so any that shares no orientation with the bridge decides
            // too: returning the bridge's mask would leave UIKit with no orientation in common, which crashes.
            if [.fullScreen, .overFullScreen].contains(current.modalPresentationStyle)
                || current.supportedInterfaceOrientations.isDisjoint(with: mask) {
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
