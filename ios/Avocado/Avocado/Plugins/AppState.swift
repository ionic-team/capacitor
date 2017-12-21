import Foundation
import SafariServices

@objc(AppState)
public class AppState : AVCPlugin {
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
}


