/**
 * Notificaton types for NSNotificationCenter
 */
@objc public enum CAPNotifications: Int {
  case URLOpen
  
  public func name() -> String {
    switch self {
      case .URLOpen: return "CAPNotificationsURLOpen"
    }
  }
}
