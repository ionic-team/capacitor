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
  case DidStartProvisionalNavigation
  case DidFinishNavigation
  case DidFailNavigation
  case DidFailProvisionalNavigation
  
  public func name() -> String {
    switch self {
      case .URLOpen: return "CAPNotificationsURLOpen"
      case .UniversalLinkOpen: return "CAPUniversalLinkOpen"
      case .ContinueActivity: return "CAPNotificationsContinueActivity"
      case .DidRegisterForRemoteNotificationsWithDeviceToken: return "CAPDidRegisterForRemoteNotificationsWithDeviceToken"
      case .DidFailToRegisterForRemoteNotificationsWithError: return "CAPDidFailToRegisterForRemoteNotificationsWithError"
      case .DecidePolicyForNavigationAction: return "CAPDecidePolicyForNavigationAction"
      case .DidStartProvisionalNavigation: return "CAPDidStartProvisionalNavigation"
      case .DidFinishNavigation: return "CAPDidFinishNavigation"
      case .DidFailNavigation: return "CAPDidFailNavigation"
      case .DidFailProvisionalNavigation: return "CAPDidFailProvisionalNavigation"
    }
  }
}
