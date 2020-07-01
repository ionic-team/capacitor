import Foundation
import UserNotifications

enum PushNotificationError: Error {
  case tokenParsingFailed
}

/**
 * Implement Push Notifications
 */
@objc(CAPPushNotificationsPlugin)
public class CAPPushNotificationsPlugin : CAPPlugin {
  // Local list of notification id -> JSObject for storing options
  // between notification requets
  var notificationRequestLookup = [String:JSObject]()

  public override func load() {
    NotificationCenter.default.addObserver(self, selector: #selector(self.didRegisterForRemoteNotificationsWithDeviceToken(notification:)), name: Notification.Name(CAPNotifications.DidRegisterForRemoteNotificationsWithDeviceToken.name()), object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(self.didFailToRegisterForRemoteNotificationsWithError(notification:)), name: Notification.Name(CAPNotifications.DidFailToRegisterForRemoteNotificationsWithError.name()), object: nil)
  }

  /**
   * Register for push notifications
   */
  @objc func register(_ call: CAPPluginCall) {
    DispatchQueue.main.async {
      UIApplication.shared.registerForRemoteNotifications()
    }
    call.success()
  }

  /**
   * Request notification permission
   */
  @objc func requestPermission(_ call: CAPPluginCall) {
    self.bridge.notificationsDelegate.requestPermissions() { granted, error in
        guard error == nil else {
            call.error(error!.localizedDescription)
            return
        }
        call.success(["granted": granted])
    }
  }

  /**
   * Get notifications in Notification Center
   */
  @objc func getDeliveredNotifications(_ call: CAPPluginCall) {
    UNUserNotificationCenter.current().getDeliveredNotifications(completionHandler: { (notifications) in
      let ret = notifications.map({ (notification) -> [String:Any] in
        return self.bridge.notificationsDelegate.makePushNotificationRequestJSObject(notification.request)
      })
      call.success([
        "notifications": ret
      ])
    })
  }

  /**
   * Remove specified notifications from Notification Center
   */
  @objc func removeDeliveredNotifications(_ call: CAPPluginCall) {
    guard let notifications = call.getArray("notifications", JSObject.self, []) else {
      call.error("Must supply notifications to remove")
      return
    }

    let ids = notifications.map { $0["id"] as? String ?? "" }

    UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: ids)
    call.success()
  }

  /**
   * Remove all notifications from Notification Center
   */
  @objc func removeAllDeliveredNotifications(_ call: CAPPluginCall) {
    UNUserNotificationCenter.current().removeAllDeliveredNotifications()
    DispatchQueue.main.async(execute: {
      UIApplication.shared.applicationIconBadgeNumber = 0
    })
    call.success()
  }

  @objc func createChannel(_ call: CAPPluginCall) {
    call.unimplemented()
  }

  @objc func deleteChannel(_ call: CAPPluginCall) {
    call.unimplemented()
  }

  @objc func listChannels(_ call: CAPPluginCall) {
    call.unimplemented()
  }

  @objc public func didRegisterForRemoteNotificationsWithDeviceToken(notification: NSNotification){
    if let deviceToken = notification.object as? Data {
      let deviceTokenString = deviceToken.reduce("", {$0 + String(format: "%02X", $1)})
      notifyListeners("registration", data:[
        "value": deviceTokenString
      ])
    } else if let stringToken = notification.object as? String {
      notifyListeners("registration", data:[
        "value": stringToken
      ])
    } else {
      notifyListeners("registrationError", data: [
        "error": PushNotificationError.tokenParsingFailed.localizedDescription
      ])
    }
  }

  @objc public func didFailToRegisterForRemoteNotificationsWithError(notification: NSNotification){
    guard let error = notification.object as? Error else {
      return
    }
    notifyListeners("registrationError", data:[
      "error": error.localizedDescription
    ])
  }

}
