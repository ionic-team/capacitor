/**
 * Notificaton types for NSNotificationCenter
 */
@objc public enum CAPNotifications: Int {
    // swiftlint:disable identifier_name
    case URLOpen
    case UniversalLinkOpen
    case ContinueActivity
    case DidRegisterForRemoteNotificationsWithDeviceToken
    case DidFailToRegisterForRemoteNotificationsWithError
    case DecidePolicyForNavigationAction
    // swiftlint:enable identifier_name
    
    @available(*, deprecated, message: "Notifications have been moved")
    public func name() -> String {
        switch self {
        case .URLOpen:
            return "CAPNotificationsURLOpen"
        case .UniversalLinkOpen:
            return "CAPUniversalLinkOpen"
        case .ContinueActivity:
            return "CAPNotificationsContinueActivity"
        case .DidRegisterForRemoteNotificationsWithDeviceToken:
            return "CAPDidRegisterForRemoteNotificationsWithDeviceToken"
        case .DidFailToRegisterForRemoteNotificationsWithError:
            return "CAPDidFailToRegisterForRemoteNotificationsWithError"
        case .DecidePolicyForNavigationAction:
            return "CAPDecidePolicyForNavigationAction"
        }
    }
}


//    @objc public static let statusBarTappedNotification = Notification(name: Notification.Name(rawValue: "statusBarTappedNotification"))

