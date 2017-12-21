import Foundation
import SafariServices

@objc(AppState)
public class AppState : AVCPlugin {

  public func fireChange(isActive: Bool) {
    notifyListeners("appStateChanged", data: [
      "isActive": isActive
    ])
  }
}


