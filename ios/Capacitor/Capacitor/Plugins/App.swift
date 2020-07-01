import Foundation

@objc(CAPAppPlugin)
public class CAPAppPlugin : CAPPlugin {
  var lastUrlOpenOptions: [String:Any?]?
  
  public override func load() {
    NotificationCenter.default.addObserver(self, selector: #selector(self.handleUrlOpened(notification:)), name: Notification.Name(CAPNotifications.URLOpen.name()), object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(self.handleUniversalLink(notification:)), name: Notification.Name(CAPNotifications.UniversalLinkOpen.name()), object: nil)
  }
  
  @objc func handleUrlOpened(notification: NSNotification) {
    guard let object = notification.object as? [String:Any?] else {
      return
    }
    
    notifyListeners("appUrlOpen", data: makeUrlOpenObject(object), retainUntilConsumed: true)
  }
  
  @objc func handleUniversalLink(notification: NSNotification) {
    guard let object = notification.object as? [String:Any?] else {
      return
    }
    
    notifyListeners("appUrlOpen", data: makeUrlOpenObject(object), retainUntilConsumed: true)
  }
  
  func makeUrlOpenObject(_ object: [String:Any?]) -> JSObject {
    guard let url = object["url"] as? NSURL else {
      return [:]
    }
    
    let options = object["options"] as? [String:Any?] ?? [:]
    return [
      "url": url.absoluteString ?? "",
      "iosSourceApplication": options[UIApplication.OpenURLOptionsKey.sourceApplication.rawValue] as? String ?? "",
      "iosOpenInPlace": options[UIApplication.OpenURLOptionsKey.openInPlace.rawValue] as? String ?? ""
    ]
  }
  
  func firePluginError(_ jsError: JSProcessingError) {
    notifyListeners("pluginError", data: [
      "message": jsError.localizedDescription
    ])
  }
  
  public func fireChange(isActive: Bool) {
    notifyListeners("appStateChange", data: [
      "isActive": isActive
    ])
  }
  
  @objc func exitApp(_ call: CAPPluginCall) {
    call.unimplemented()
  }

  @objc func getLaunchUrl(_ call: CAPPluginCall) {
    if let lastUrl = CAPBridge.getLastUrl() {
      let urlValue = lastUrl.absoluteString
      call.resolve([
        "url": urlValue
      ])
    }
    call.resolve()
  }

  @objc func getState(_ call: CAPPluginCall) {
    DispatchQueue.main.async {
      call.resolve([
        "isActive": UIApplication.shared.applicationState == UIApplication.State.active
      ])
    }
  }

  @objc func canOpenUrl(_ call: CAPPluginCall) {
    guard let urlString = call.getString("url") else {
      call.error("Must supply a URL")
      return
    }
    
    guard let url = URL.init(string: urlString) else {
      call.error("Invalid URL")
      return
    }

    DispatchQueue.main.async {
      let canOpen = UIApplication.shared.canOpenURL(url)
      
      call.success([
        "value": canOpen
      ])
    }
  }
  
  @objc func openUrl(_ call: CAPPluginCall) {
    guard let urlString = call.getString("url") else {
      call.error("Must supply a URL")
      return
    }
    
    guard let url = URL.init(string: urlString) else {
      call.error("Invalid URL")
      return
    }
    
    DispatchQueue.main.async {
      UIApplication.shared.open(url, options: [:]) { (completed) in
        call.success([
          "completed": completed
        ])
      }
    }
  }
}


