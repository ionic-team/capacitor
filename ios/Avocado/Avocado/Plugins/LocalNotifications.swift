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
    
    let repeatAt = call.get("repeat", [String:Any].self)
    
    var trigger: UNNotificationTrigger?
    if let scheduleAt = call.getDate("scheduleAt") {
      let dateInfo = Calendar.current.dateComponents(in: TimeZone.current, from: scheduleAt)
      let repeats = call.get("repeats", Bool.self, false)!
      
      // If we have a scheduled time and a repeat setting, create a time interval for it
      if repeatAt != nil {
        let interval = getRepeatDateInterval(repeatAt!, dateInfo)
        print("Repeating at", interval)
        if interval != nil {
          trigger = UNTimeIntervalNotificationTrigger(timeInterval: interval!.duration, repeats: repeats)
        }
      } else {
        trigger = UNCalendarNotificationTrigger(dateMatching: dateInfo, repeats: repeats)
      }
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
  
  @objc public func cancel(_ call: AVCPluginCall) {
    guard let ids = call.getArray("ids", String.self, []) else {
      call.error("Must supply ids for notifications")
      return
    }
    
    UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ids)
  }
  
  /*
  func getDateInfo(_ at: Date) -> DateComponents {
    var dateInfo = Calendar.current.dateComponents(in: TimeZone.current, from: Date())
    dateInfo.calendar = Calendar.current
    
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
  }*/
  
  func getRepeatDateInterval(_ repeats: [String:Any], _ dateInfo: DateComponents) -> DateInterval? {
    guard let every = repeats["every"] as? String else {
      return nil
    }
    let cal = Calendar.current
    
    switch every {
    case "year":
      let newDate = cal.date(byAdding: .year, value: 1, to: dateInfo.date!)!
      return DateInterval(start: dateInfo.date!, end: newDate)
    case "month":
      let newDate = cal.date(byAdding: .month, value: 1, to: dateInfo.date!)!
      return DateInterval(start: dateInfo.date!, end: newDate)
    case "two-weeks":
      let newDate = cal.date(byAdding: .weekOfYear, value: 2, to: dateInfo.date!)!
      return DateInterval(start: dateInfo.date!, end: newDate)
    case "week":
      let newDate = cal.date(byAdding: .weekOfYear, value: 1, to: dateInfo.date!)!
      return DateInterval(start: dateInfo.date!, end: newDate)
    case "day":
      let newDate = cal.date(byAdding: .day, value: 1, to: dateInfo.date!)!
      return DateInterval(start: dateInfo.date!, end: newDate)
    case "day":
      let newDate = cal.date(byAdding: .day, value: 1, to: dateInfo.date!)!
      return DateInterval(start: dateInfo.date!, end: newDate)
    case "hour":
      let newDate = cal.date(byAdding: .hour, value: 1, to: dateInfo.date!)!
      return DateInterval(start: dateInfo.date!, end: newDate)
    case "minute":
      let newDate = cal.date(byAdding: .minute, value: 1, to: dateInfo.date!)!
      return DateInterval(start: dateInfo.date!, end: newDate)
    case "second":
      let newDate = cal.date(byAdding: .second, value: 1, to: dateInfo.date!)!
      return DateInterval(start: dateInfo.date!, end: newDate)
    default:
      return nil
    }
  }
}

