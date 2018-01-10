/**
 * Notificaton types for NSNotificationCenter
 */
@objc public enum CAPNotifications: Int {
  case URLOpen
  case UniversalLinkOpen
  case ContinueActivity
  
  public func name() -> String {
    switch self {
    case .URLOpen: return "CAPNotificationsURLOpen"
    case .UniversalLinkOpen: return "CAPUniversalLinkOpen"
    case .ContinueActivity: return "CAPNotificationsContinueActivity"
    }
  }
}
