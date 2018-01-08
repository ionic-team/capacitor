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
}


