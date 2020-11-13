import Foundation

// the @available compiler directive does not provide an easy way to split apart string literals, so ignore the line length
// swiftlint:disable line_length
@available(*, deprecated, message: "'statusBarTappedNotification' has been moved to Notification.Name.capacitorStatusBarTapped. 'getLastUrl' and application delegate methods have been moved to ApplicationDelegateProxy.")
// swiftlint:enable line_length
@objc public class CAPBridge: NSObject {
    @objc public static let statusBarTappedNotification = Notification(name: .capacitorStatusBarTapped)

    public static func getLastUrl() -> URL? {
        return ApplicationDelegateProxy.shared.lastURL
    }

    public static func handleOpenUrl(_ url: URL, _ options: [UIApplication.OpenURLOptionsKey: Any]) -> Bool {
        return ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: options)
    }

    public static func handleContinueActivity(_ userActivity: NSUserActivity, _ restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: restorationHandler)
    }

    public static func handleAppBecameActive(_ application: UIApplication) {
        // no-op for now
    }
}
