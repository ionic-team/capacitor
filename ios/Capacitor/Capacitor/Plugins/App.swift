import Foundation
import SafariServices

@objc(App)
public class App : CAPPlugin {
  func firePluginError(_ jsError: JSProcessingError) {
    notifyListeners("pluginError", data: [
      "message": jsError.localizedDescription
    ])
  }
  
  public func fireChange(isActive: Bool) {
    notifyListeners("appStateChanged", data: [
      "isActive": isActive
    ])
  }
  
  @objc func getLaunchUrl(_ call: CAPPluginCall) {
    call.success()
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

    let canOpen = UIApplication.shared.canOpenURL(url)
    
    call.success([
      "value": canOpen
    ])
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
    
    UIApplication.shared.open(url, options: [:]) { (completed) in
      call.success([
        "completed": completed
      ])
    }
  }
}


