/**
 * Notificaton types for NSNotificationCenter
 */
@objc public enum CAPNotifications: Int {
  case URLOpen
  case UniversalLinkOpen
  case ContinueActivity
  case DidRegisterForRemoteNotificationsWithDeviceToken
  case DidFailToRegisterForRemoteNotificationsWithError
  case DecidePolicyForNavigationAction
  
  public func name() -> String {
    switch self {
      case .URLOpen: return "CAPNotificationsURLOpen"
      case .UniversalLinkOpen: return "CAPUniversalLinkOpen"
      case .ContinueActivity: return "CAPNotificationsContinueActivity"
      case .DidRegisterForRemoteNotificationsWithDeviceToken: return "CAPDidRegisterForRemoteNotificationsWithDeviceToken"
      case .DidFailToRegisterForRemoteNotificationsWithError: return "CAPDidFailToRegisterForRemoteNotificationsWithError"
      case .DecidePolicyForNavigationAction: return "CAPDecidePolicyForNavigationAction"
    }
  }
}
