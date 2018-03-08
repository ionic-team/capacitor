import Foundation
import UserNotifications

@objc(CAPPushNotificationsPlugin)
public class CAPPushNotificationsPlugin : CAPPlugin {

  public override func load() {
    
  }
  
  @objc func setup(_ call: CAPPluginCall) {
    let options = call.getObject("options") ?? [:]
    call.success()
  }
  
  @objc public override func requestPermissions(_ call: CAPPluginCall) {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) {
      (granted, error) in
      if (!granted || error != nil) {
        call.error("User denied permissions for Push Notifications")
        return
      }
      call.success([
        "value": granted
      ])
    }
  }
}
