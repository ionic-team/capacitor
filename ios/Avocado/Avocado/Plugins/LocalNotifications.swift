import Foundation
import UserNotifications

/**
 * Implement three common modal types: alert, confirm, and prompt
 */
@objc(LocalNotifications)
public class LocalNotifications : AVCPlugin {
  func requestPermissions() {
    // Override point for customization after application launch.
    let center = UNUserNotificationCenter.current()
    center.requestAuthorization(options:[.badge, .alert, .sound]) { (granted, error) in
      // Enable or disable features based on authorization.
    }
    
    DispatchQueue.main.async {
      UIApplication.shared.registerForRemoteNotifications()
    }
  }
  
  @objc public func schedule(_ call: AVCPluginCall) {
    guard let title = call.get("title", String.self) else {
      call.error("Must provide a title")
      return
    }
    guard let body = call.get("body", String.self) else {
      call.error("Must provide a body")
      return
    }
    guard let identifier = call.get("identifier", String.self) else {
      call.error("Must provide a unique identifier for the notification")
      return
    }
    
    requestPermissions()
    
    // Build content of notification
    let content = UNMutableNotificationContent()
    content.title = NSString.localizedUserNotificationString(forKey: title, arguments: nil)
    content.body = NSString.localizedUserNotificationString(forKey: body,
                                                            arguments: nil)
    
    var trigger: UNCalendarNotificationTrigger?
    if let scheduleAt = call.get("scheduleAt", [String:Int].self) {
      let dateInfo = getDateInfo(scheduleAt)
      let repeats = call.get("repeats", Bool.self, false)!
      trigger = UNCalendarNotificationTrigger(dateMatching: dateInfo, repeats: repeats)
    }
    
    // Create the request object.
    let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
    
    // Schedule the request.
    let center = UNUserNotificationCenter.current()
    center.add(request) { (error : Error?) in
      if let theError = error {
        print(theError.localizedDescription)
        call.error(theError.localizedDescription)
      }
    }
    
    // Call success immediately
    call.success([
      "id": request.identifier
    ])
  }
  
  func getDateInfo(_ at: [String:Int]) -> DateComponents {
    var dateInfo = DateComponents()
    if let year = at["year"] {
      dateInfo.year = year
    }
    if let month = at["month"] {
      dateInfo.month = month
    }
    if let day = at["day"] {
      dateInfo.day = day
    }
    if let hour = at["hour"] {
      dateInfo.hour = hour
    }
    if let minute = at["minute"] {
      dateInfo.minute = minute
    }
    if let second = at["second"] {
      dateInfo.second = second
    }
    return dateInfo
  }
}

