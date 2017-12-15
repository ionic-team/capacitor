import Foundation
import UserNotifications

/**
 * Implement three common modal types: alert, confirm, and prompt
 */
@objc(LocalNotifications)
public class LocalNotifications : AVCPlugin {
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
    
    let content = UNMutableNotificationContent()
    content.title = NSString.localizedUserNotificationString(forKey: title, arguments: nil)
    content.body = NSString.localizedUserNotificationString(forKey: body,
                                                            arguments: nil)
    
    var trigger: UNCalendarNotificationTrigger?
    if let scheduleAt = call.get("scheduleAt", [String:Int].self) {
      // Configure the trigger for a 7am wakeup.
      var dateInfo = DateComponents()
      if let year = scheduleAt["year"] {
        dateInfo.year = year
      }
      if let month = scheduleAt["month"] {
        dateInfo.month = month
      }
      if let day = scheduleAt["day"] {
        dateInfo.day = day
      }
      if let hour = scheduleAt["hour"] {
        dateInfo.hour = hour
      }
      if let minute = scheduleAt["minute"] {
        dateInfo.minute = minute
      }
      if let second = scheduleAt["second"] {
        dateInfo.second = second
      }
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
}

