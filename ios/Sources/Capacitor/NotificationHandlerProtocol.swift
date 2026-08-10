import Foundation
import UserNotifications

@objc(CAPNotificationHandlerProtocol) public protocol NotificationHandlerProtocol {
    func willPresent(notification: UNNotification) -> UNNotificationPresentationOptions
    func didReceive(response: UNNotificationResponse)
}
