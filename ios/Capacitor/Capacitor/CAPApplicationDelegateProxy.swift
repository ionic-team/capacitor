
import Foundation

@objc public class CAPApplicationDelegateProxy: NSObject, UIApplicationDelegate {
    static let shared = CAPApplicationDelegateProxy()
    
    private(set) var lastURL: URL?
    
    public func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        NotificationCenter.default.post(name: Notification.Name(CAPNotifications.URLOpen.name()), object: [
            "url": url,
            "options": options
        ])
        NotificationCenter.default.post(name: NSNotification.Name.CDVPluginHandleOpenURL, object: url)
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
        NotificationCenter.default.post(name: Notification.Name(CAPNotifications.UniversalLinkOpen.name()), object: [
            "url": url
        ])
        return true
    }
}
