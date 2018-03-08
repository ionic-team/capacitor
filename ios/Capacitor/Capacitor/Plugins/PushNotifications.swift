import Foundation
import UserNotifications

@objc(CAPPushNotificationsPlugin)
public class CAPPushNotificationsPlugin : CAPPlugin {
  let DEFAULT_PROMPT_FOR_PERMISSIONS = true
  let EVENT_REGISTER_ERROR = "pushRegisterError"
  
  public override func load() {
    NotificationCenter.default.addObserver(self, selector: #selector(self.handleRegisterError(notification:)), name: Notification.Name(CAPNotifications.PushNotificationsRegisterError.name()), object: nil)
  }
  
  
  @objc func setup(_ call: CAPPluginCall) {
    self.setupCheckPermissions(call)
  }
  
  /**
   * Before registering, check permissions and, optionally, prompt for permissions (or error out)
   */
  func setupCheckPermissions(_ call: CAPPluginCall) {
    let options = call.getObject("options") ?? [:]
    
    let promptForPermissions = options["promptForPermissions"] as? Bool ?? DEFAULT_PROMPT_FOR_PERMISSIONS
    
    checkPermissions { (authorizationStatus) in
      if authorizationStatus == .authorized {
        self.setupRegister(call)
      } else if authorizationStatus == .denied {
        self.permissionDenied(call)
        return
      } else if authorizationStatus != .authorized {
        if promptForPermissions {
          self.requestPushPermissions(completion: { (granted) in
            if granted {
              self.setupRegister(call)
            } else {
              self.permissionDenied(call)
            }
          })
        } else {
          call.error("promptForPermissions is false, so you must call requestPermissions first.")
        }
      }
    }
  }
  
  func setupRegister(_ call: CAPPluginCall) {
    print("Continuing to register...")
    DispatchQueue.main.async {
      UIApplication.shared.registerForRemoteNotifications()
    }
  }
  
  func permissionDenied(_ call: CAPPluginCall) {
    call.error("User denied push notifications")
  }
  
  @objc func handleRegisterError(notification: NSNotification) {
    guard let error = notification.object as? Error else {
      return
    }
    
    notifyListeners(EVENT_REGISTER_ERROR, data: [
      "error": error.localizedDescription
    ])
  }
  
  @objc public override func requestPermissions(_ call: CAPPluginCall) {
    requestPushPermissions { (granted) in
      call.success([
        "value": granted
      ])
    }
  }
  
  func requestPushPermissions(completion: @escaping (Bool) -> Void) {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) {
      (granted, error) in
      if !granted || error != nil {
        completion(false)
      } else {
        completion(granted)
      }
    }
  }
  
  func checkPermissions(completion: @escaping (UNAuthorizationStatus) -> Void) {
    UNUserNotificationCenter.current().getNotificationSettings { (settings) in
      completion(settings.authorizationStatus)
    }
  }
  
}
