/**
 Notificaton types for NotificationCenter and NSNotificationCenter

 We want to include `capacitor` in the name(s) to uniquely identify these even though it can make the names long
 and the deprecated notifications are only here for backwards compatibility.
 */
// swiftlint:disable identifier_name
extension Notification.Name {
    public static let capacitorOpenURL = Notification.Name(rawValue: "CapacitorOpenURLNotification")
    public static let capacitorOpenUniversalLink = Notification.Name(rawValue: "CapacitorOpenUniversalLinkNotification")
    public static let capacitorContinueActivity = Notification.Name(rawValue: "CapacitorContinueActivityNotification")
    public static let capacitorDidRegisterForRemoteNotifications =
        Notification.Name(rawValue: "CapacitorDidRegisterForRemoteNotificationsNotification")
    public static let capacitorDidFailToRegisterForRemoteNotifications =
        Notification.Name(rawValue: "CapacitorDidFailToRegisterForRemoteNotificationsNotification")
    public static let capacitorDecidePolicyForNavigationAction =
        Notification.Name(rawValue: "CapacitorDecidePolicyForNavigationActionNotification")
    public static let capacitorStatusBarTapped = Notification.Name(rawValue: "CapacitorStatusBarTappedNotification")
}

@objc extension NSNotification {
    public static let capacitorOpenURL = Notification.Name.capacitorOpenURL
    public static let capacitorOpenUniversalLink = Notification.Name.capacitorOpenUniversalLink
    public static let capacitorContinueActivity = Notification.Name.capacitorContinueActivity
    public static let capacitorDidRegisterForRemoteNotifications = Notification.Name.capacitorDidRegisterForRemoteNotifications
    public static let capacitorDidFailToRegisterForRemoteNotifications = Notification.Name.capacitorDidFailToRegisterForRemoteNotifications
    public static let capacitorDecidePolicyForNavigationAction = Notification.Name.capacitorDecidePolicyForNavigationAction
    public static let capacitorStatusBarTapped = Notification.Name.capacitorStatusBarTapped
}

/**
 Deprecated, will be removed
 */
@objc public enum CAPNotifications: Int {
    @available(*, deprecated, message: "renamed to 'Notification.Name.capacitorOpenURL'")
    case URLOpen
    @available(*, deprecated, message: "renamed to 'Notification.Name.capacitorOpenUniversalLink'")
    case UniversalLinkOpen
    @available(*, deprecated, message: "Notification.Name.capacitorContinueActivity'")
    case ContinueActivity
    @available(*, deprecated, message: "renamed to 'Notification.Name.capacitorDidRegisterForRemoteNotifications'")
    case DidRegisterForRemoteNotificationsWithDeviceToken
    @available(*, deprecated, message: "renamed to 'Notification.Name.capacitorDidFailToRegisterForRemoteNotifications'")
    case DidFailToRegisterForRemoteNotificationsWithError
    @available(*, deprecated, message: "renamed to 'Notification.Name.capacitorDecidePolicyForNavigationAction'")
    case DecidePolicyForNavigationAction

    public func name() -> String {
        switch self {
        case .URLOpen:
            return Notification.Name.capacitorOpenURL.rawValue
        case .UniversalLinkOpen:
            return Notification.Name.capacitorOpenUniversalLink.rawValue
        case .ContinueActivity:
            return Notification.Name.capacitorContinueActivity.rawValue
        case .DidRegisterForRemoteNotificationsWithDeviceToken:
            return Notification.Name.capacitorDidRegisterForRemoteNotifications.rawValue
        case .DidFailToRegisterForRemoteNotificationsWithError:
            return Notification.Name.capacitorDidFailToRegisterForRemoteNotifications.rawValue
        case .DecidePolicyForNavigationAction:
            return Notification.Name.capacitorDecidePolicyForNavigationAction.rawValue
        }
    }
}
// swiftlint:enable identifier_name
