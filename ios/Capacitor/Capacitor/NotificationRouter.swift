import Foundation

@objc(CAPNotificationRouter) public class NotificationRouter: NSObject, UNUserNotificationCenterDelegate {
    var handleApplicationNotifications: Bool {
        get {
            return UNUserNotificationCenter.current().delegate === self
        }
        set {
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
