import Foundation

@objc(CAPUNUserNotificationCenterDelegate) public class UserNotificationCenterDelegate: NSObject, UNUserNotificationCenterDelegate  {
    override init() {
        // TODO: make better
        super.init()
        let center = UNUserNotificationCenter.current()
        if center.delegate == nil {
            center.delegate = self
        }
    }
    
    weak var pushNotificationHandler: NotificationHandlerProtocol? {
        didSet {
            if pushNotificationHandler != nil, oldValue != nil {
                CAPLog.print("Push notification handler overriding previous instance: \(String(describing: type(of: oldValue)))")
            }
        }
    }
    
    weak var localNotificationHandler: NotificationHandlerProtocol? {
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
