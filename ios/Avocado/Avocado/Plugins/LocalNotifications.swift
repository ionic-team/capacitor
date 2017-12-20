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
  
  @objc func schedule(_ call: AVCPluginCall) {
    guard let notifications = call.getArray("notifications", [String:Any].self) else {
      call.error("Must provide notifications array as notifications option")
      return
    }
    
    var ids = [String]()
    
    for notification in notifications {
      guard let identifier = notification["id"] as? String else {
        call.error("Must provide a unique identifier for notification")
        return
      }
      guard let title = notification["title"] as? String else {
        call.error("Must provide a title for notification \(identifier)")
        return
      }
      guard let body = notification["body"] as? String else {
        call.error("Must provide a body for notification \(identifier)")
        return
      }
      requestPermissions()
      
      // Build content of notification
      let content = UNMutableNotificationContent()
      content.title = NSString.localizedUserNotificationString(forKey: title, arguments: nil)
      content.body = NSString.localizedUserNotificationString(forKey: body,
                                                              arguments: nil)
      
      var trigger: UNNotificationTrigger?
      if let schedule = notification["schedule"] as? [String:Any] {
        trigger = handleScheduledNotification(call, schedule)
      }
      
      // Schedule the request.
      let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
      let center = UNUserNotificationCenter.current()
      center.add(request) { (error : Error?) in
        if let theError = error {
          print(theError.localizedDescription)
          call.error(theError.localizedDescription)
        }
      }
      
      ids.append(request.identifier)
    }

    call.success([
      "ids": ids
    ])
  }
  
  @objc func cancel(_ call: AVCPluginCall) {
    guard let ids = call.getArray("ids", String.self, []) else {
      call.error("Must supply notification ids to cancel")
      return
    }
    
    UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ids)
  }
  
  @objc func getPending(_ call: AVCPluginCall) {
    UNUserNotificationCenter.current().getPendingNotificationRequests(completionHandler: { (notifications) in
      print("num of pending notifications \(notifications.count)")
      print(notifications)
      
      let ret = notifications.map({ (notification) -> [String:Any] in
        return self.notificationRequestToDict(notification)
      })
      call.success([
        "notifications": ret
      ])
    })
  }
  
  func handleScheduledNotification(_ call: AVCPluginCall, _ schedule: [String:Any]) -> UNNotificationTrigger? {
    let at = schedule["at"] as? Date
    let every = schedule["every"] as? String
    let on = schedule["on"] as? [String:Int]
    let repeats = schedule["repeats"] as? Bool ?? false

    // If there's a specific date for this notificiation
    if at != nil {
      let dateInfo = Calendar.current.dateComponents(in: TimeZone.current, from: at!)

      if dateInfo.date! < Date() {
        call.error("Scheduled time must be *after* current time")
        return nil
      }
    
      var dateInterval = DateInterval(start: Date(), end: dateInfo.date!)
      return UNTimeIntervalNotificationTrigger(timeInterval: dateInterval.duration, repeats: repeats)
    }
    
    // If this notification should repeat every day/month/week/etc. or on a certain
    // matching set of date components
    if on != nil {
      let dateComponents = getDateComponents(on!)
      return UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
    }
    
    if every != nil {
      if let repeatDateInterval = getRepeatDateInterval(every!) {
        return UNTimeIntervalNotificationTrigger(timeInterval: repeatDateInterval.duration, repeats: true)
      }
    }
    
    return nil
  }
  
  func getDateComponents(_ at: [String:Int]) -> DateComponents {
    //var dateInfo = Calendar.current.dateComponents(in: TimeZone.current, from: Date())
    //dateInfo.calendar = Calendar.current
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
  
  func getRepeatDateInterval(_ every: String) -> DateInterval? {
    let cal = Calendar.current
    let now = Date()
    switch every {
    case "year":
      let newDate = cal.date(byAdding: .year, value: 1, to: now)!
      return DateInterval(start: now, end: newDate)
    case "month":
      let newDate = cal.date(byAdding: .month, value: 1, to: now)!
      return DateInterval(start: now, end: newDate)
    case "two-weeks":
      let newDate = cal.date(byAdding: .weekOfYear, value: 2, to: now)!
      return DateInterval(start: now, end: newDate)
    case "week":
      let newDate = cal.date(byAdding: .weekOfYear, value: 1, to: now)!
      return DateInterval(start: now, end: newDate)
    case "day":
      let newDate = cal.date(byAdding: .day, value: 1, to: now)!
      return DateInterval(start: now, end: newDate)
    case "day":
      let newDate = cal.date(byAdding: .day, value: 1, to: now)!
      return DateInterval(start: now, end: newDate)
    case "hour":
      let newDate = cal.date(byAdding: .hour, value: 1, to: now)!
      return DateInterval(start: now, end: newDate)
    case "minute":
      let newDate = cal.date(byAdding: .minute, value: 1, to: now)!
      return DateInterval(start: now, end: newDate)
    case "second":
      let newDate = cal.date(byAdding: .second, value: 1, to: now)!
      return DateInterval(start: now, end: newDate)
    default:
      return nil
    }
  }
  
  func notificationRequestToDict(_ request: UNNotificationRequest) -> [String:Any] {
    return [
      "id": request.identifier
    ]
  }
}

