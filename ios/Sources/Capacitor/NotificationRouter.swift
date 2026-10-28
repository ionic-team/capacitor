import Foundation

@objc(CAPNotificationRouter) public class NotificationRouter: NSObject, UNUserNotificationCenterDelegate {
    // UNUserNotificationCenter.current() raises when the process has no application bundle, which
    // is the case in a host-less unit test runner and some extension contexts. There is no
    // notification center to register with there, so treat it as unavailable rather than trapping.
    private static var isNotificationCenterAvailable: Bool {
        return ["app", "appex"].contains(Bundle.main.bundleURL.pathExtension)
    }

    var handleApplicationNotifications: Bool {
        get {
            guard Self.isNotificationCenterAvailable else { return false }
            return UNUserNotificationCenter.current().delegate === self
        }
        set {
            guard Self.isNotificationCenterAvailable else { return }
            let center = UNUserNotificationCenter.current()

            if newValue {
                center.delegate = self
            } else if center.delegate === self {
                center.delegate = nil
            }
        }
    }

    public weak var pushNotificationHandler: NotificationHandlerProtocol? {
        didSet {
            if pushNotificationHandler != nil, oldValue != nil {
                CAPLog.print("Push notification handler overriding previous instance: \(String(describing: type(of: oldValue)))")
            }
        }
    }

    public weak var localNotificationHandler: NotificationHandlerProtocol? {
        didSet {
            if localNotificationHandler != nil, oldValue != nil {
                CAPLog.print("Local notification handler overriding previous instance: \(String(describing: type(of: oldValue)))")
            }
        }
    }

    public func userNotificationCenter(_ center: UNUserNotificationCenter,
                                       willPresent notification: UNNotification,
                                       withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        let presentationOptions: UNNotificationPresentationOptions?

        if notification.request.trigger?.isKind(of: UNPushNotificationTrigger.self) == true {
            presentationOptions = pushNotificationHandler?.willPresent(notification: notification)
        } else {
            presentationOptions = localNotificationHandler?.willPresent(notification: notification)
        }

        completionHandler(presentationOptions ?? [])
    }

    public func userNotificationCenter(_ center: UNUserNotificationCenter,
                                       didReceive response: UNNotificationResponse,
                                       withCompletionHandler completionHandler: @escaping () -> Void) {
        if response.notification.request.trigger?.isKind(of: UNPushNotificationTrigger.self) == true {
            pushNotificationHandler?.didReceive(response: response)
        } else {
            localNotificationHandler?.didReceive(response: response)
        }

        completionHandler()
    }
}
