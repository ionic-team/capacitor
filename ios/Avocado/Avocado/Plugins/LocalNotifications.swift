import Foundation
import UserNotifications

enum LocalNotificationError: LocalizedError {
  case contentNoId
  case contentNoTitle
  case contentNoBody
  case triggerConstructionFailed
  case triggerRepeatIntervalTooShort
  case attachmentNoId
  case attachmentNoUrl
  case attachmentFileNotFound(path: String)
  case attachmentUnableToCreate(String)

  var errorDescription: String? {
    switch self {
    case .attachmentFileNotFound(path: let path):
      return "Unable to find file \(path) for attachment"
    default:
      return ""
    }
  }
}
  
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
    
    requestPermissions()
    
    var ids = [String]()
    
    for notification in notifications {
      guard let identifier = notification["id"] as? String else {
        call.error("Notification missing identifier")
        return
      }
      
      var content: UNNotificationContent
      do {
        content = try makeNotificationContent(notification)
      } catch {
        print(error.localizedDescription)
        call.error("Unable to make notification", error)
        return
      }
      
      var trigger: UNNotificationTrigger?
      
      do {
        if let schedule = notification["schedule"] as? [String:Any] {
          try trigger = handleScheduledNotification(call, schedule)
        }
      } catch {
        call.error("Unable to create notification, trigger failed", error)
        return
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
    guard let notifications = call.getArray("notifications", JSObject.self, []) else {
      call.error("Must supply notifications to cancel")
      return
    }
    
    let ids = notifications.map { $0["id"] as? String ?? "" }
    
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
  
  @objc func registerActionTypes(_ call: AVCPluginCall) {
    guard let types = call.getArray("types", Any.self) as? JSArray else {
      return
    }
    
    makeActionTypes(types)
    
    call.success()
  }
  
  func makeNotificationContent(_ notification: JSObject) throws -> UNNotificationContent {
    guard let title = notification["title"] as? String else {
      throw LocalNotificationError.contentNoTitle
    }
    guard let body = notification["body"] as? String else {
      throw LocalNotificationError.contentNoBody
    }
    
    let actionTypeId = notification["actionTypeId"] as? String
    let sound = notification["sound"] as? String
    let attachments = notification["attachments"] as? JSArray
    
    let content = UNMutableNotificationContent()
    content.title = NSString.localizedUserNotificationString(forKey: title, arguments: nil)
    content.body = NSString.localizedUserNotificationString(forKey: body,
                                                            arguments: nil)
    
    if actionTypeId != nil {
      content.categoryIdentifier = actionTypeId!
    }
    
    if sound != nil {
      content.sound = UNNotificationSound(named: sound!)
    }
    
    if attachments != nil {
      content.attachments = try makeAttachments(attachments!)
    }
    
    return content
  }
  
  func handleScheduledNotification(_ call: AVCPluginCall, _ schedule: [String:Any]) throws -> UNNotificationTrigger? {
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
      
      // Notifications that repeat have to be at least a minute between each other
      if repeats && dateInterval.duration < 60 {
        throw LocalNotificationError.triggerRepeatIntervalTooShort
      }
      
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

  func makeActions(_ actions: JSArray) -> [UNNotificationAction] {
    var createdActions = [UNNotificationAction]()
    
    for action in actions {
      guard let id = action["id"] as? String else {
        bridge.modulePrint(self, "Action must have an id field")
        continue
      }
    // Create the custom actions for the TIMER_EXPIRED category.
      let newAction = UNNotificationAction(identifier: id,
                                            title: action["title"] as? String ?? "",
                                            options: makeActionOptions(action))
      createdActions.append(newAction)
    }
    
    return createdActions
  }
  
  /**
   * Make required UNNotificationCategory entries for action types
   */
  func makeActionTypes(_ actionTypes: JSArray) {
    var createdCategories = [UNNotificationCategory]()
    
    let generalCategory = UNNotificationCategory(identifier: "GENERAL",
                                                 actions: [],
                                                 intentIdentifiers: [],
                                                 options: .customDismissAction)
    
    createdCategories.append(generalCategory)
    for type in actionTypes {
      guard let id = type["id"] as? String else {
        bridge.modulePrint(self, "Action type must have an id field")
        continue
      }
      let hiddenBodyPlaceholder = type["iosHiddenPreviewsBodyPlaceholder"] as? String ?? ""
      let actions = type["actions"] as? JSArray ?? []
      
      let newActions = makeActions(actions)
      
      // Create the custom actions for the TIMER_EXPIRED category.
      var newCategory: UNNotificationCategory?
      
      if #available(iOS 11.0, *) {
        newCategory = UNNotificationCategory(identifier: id,
                                               actions: newActions,
                                               intentIdentifiers: [],
                                               hiddenPreviewsBodyPlaceholder: hiddenBodyPlaceholder,
                                               options: makeCategoryOptions(type))
      } else {
        newCategory = UNNotificationCategory(identifier: id,
                                             actions: newActions,
                                             intentIdentifiers: [],
                                             options: makeCategoryOptions(type))
      }
      
      createdCategories.append(newCategory!)
    }
    
    let center = UNUserNotificationCenter.current()
    center.setNotificationCategories(Set(createdCategories))
  }

  /**
   * Make options for UNNotificationActions
   */
  func makeActionOptions(_ action: [String:Any]) -> UNNotificationActionOptions {
    let foreground = action["foreground"] as? Bool ?? false
    let destructive = action["destructive"] as? Bool ?? false
    let requiresAuthentication = action["requiresAuthentication"] as? Bool ?? false
    
    if foreground {
      return .foreground
    }
    if destructive {
      return .destructive
    }
    if requiresAuthentication {
      return .authenticationRequired
    }
    return UNNotificationActionOptions(rawValue: 0)
  }
  
  /**
   * Make options for UNNotificationCategoryActions
   */
  func makeCategoryOptions(_ type: JSObject) -> UNNotificationCategoryOptions {
    let customDismiss = type["iosCustomDismissAction"] as? Bool ?? false
    let carPlay = type["iosAllowInCarPlay"] as? Bool ?? false
    let hiddenPreviewsShowTitle = type["iosHiddenPreviewsShowTitle"] as? Bool ?? false
    let hiddenPreviewsShowSubtitle = type["iosHiddenPreviewsShowSubtitle"] as? Bool ?? false
    
    if customDismiss {
      return .customDismissAction
    }
    if carPlay {
      return .allowInCarPlay
    }
    
    // New iOS 11 features
    if #available(iOS 11.0, *) {
      // Running iOS 11 OR NEWER
      if hiddenPreviewsShowTitle {
        return .hiddenPreviewsShowTitle
      }
      if hiddenPreviewsShowSubtitle {
        return .hiddenPreviewsShowSubtitle
      }
    }
    
    return UNNotificationCategoryOptions(rawValue: 0)
  }
  
  func makeAttachments(_ attachments: JSArray) throws -> [UNNotificationAttachment] {
    var createdAttachments = [UNNotificationAttachment]()
    
    for a in attachments {
      guard let id = a["id"] as? String else {
        throw LocalNotificationError.attachmentNoId
      }
      guard let url = a["url"] as? String else {
        throw LocalNotificationError.attachmentNoUrl
      }
      guard let urlObject = makeAttachmentUrl(url) else {
        throw LocalNotificationError.attachmentFileNotFound(path: url)
      }
      
      let options = a["options"] as? JSObject ?? [:]
      
      do {
        let newAttachment = try UNNotificationAttachment(identifier: id, url: urlObject, options: makeAttachmentOptions(options))
        createdAttachments.append(newAttachment)
      } catch {
        throw LocalNotificationError.attachmentUnableToCreate(error.localizedDescription)
      }
    }
    
    return createdAttachments
  }
  
  func makeAttachmentUrl(_ path: String) -> URL? {
    let file = AVCFileManager.get(path: path)
    print("Got file for path: ", path, file)
    return file?.url
  }
  
  func makeAttachmentOptions(_ options: JSObject) -> [AnyHashable:Any] {
    var opts = [AnyHashable:Any]()
    
    if let iosUNNotificationAttachmentOptionsTypeHintKey = options["iosUNNotificationAttachmentOptionsTypeHintKey"] as? String {
      opts[UNNotificationAttachmentOptionsTypeHintKey] = iosUNNotificationAttachmentOptionsTypeHintKey
    }
    if let iosUNNotificationAttachmentOptionsThumbnailHiddenKey = options["iosUNNotificationAttachmentOptionsThumbnailHiddenKey"] as? String {
      opts[UNNotificationAttachmentOptionsThumbnailHiddenKey] = iosUNNotificationAttachmentOptionsThumbnailHiddenKey
    }
    if let iosUNNotificationAttachmentOptionsThumbnailClippingRectKey = options["iosUNNotificationAttachmentOptionsThumbnailClippingRectKey"] as? String {
      opts[UNNotificationAttachmentOptionsThumbnailClippingRectKey] = iosUNNotificationAttachmentOptionsThumbnailClippingRectKey
    }
    if let iosUNNotificationAttachmentOptionsThumbnailTimeKey = options["iosUNNotificationAttachmentOptionsThumbnailTimeKey"] as? String {
      opts[UNNotificationAttachmentOptionsThumbnailTimeKey] = iosUNNotificationAttachmentOptionsThumbnailTimeKey
    }
    return opts
  }
}

