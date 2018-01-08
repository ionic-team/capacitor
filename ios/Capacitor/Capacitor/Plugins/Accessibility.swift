import Foundation
import SafariServices

@objc(Accessibility)
public class Accessibility : CAPPlugin {
  static let SCREEN_READER_STATE_CHANGE_EVENT = "accessibilityScreenReaderStateChange"
  public override func load() {
    NotificationCenter.default.addObserver(self,
                                           selector: #selector(self.onScreenReaderStateChanged(notification:)),
                                           name: Notification.Name(UIAccessibilityVoiceOverStatusChanged),
                                           object: nil)
  }
  
  @objc func onScreenReaderStateChanged(notification: NSNotification) {
    notifyListeners(Accessibility.SCREEN_READER_STATE_CHANGE_EVENT, data: [
      "value": UIAccessibilityIsVoiceOverRunning()
    ])
  }
  
  @objc func isScreenReaderEnabled(_ call: CAPPluginCall) {
    let voEnabled = UIAccessibilityIsVoiceOverRunning()
    call.success([
      "value": voEnabled
    ])
  }
  
  @objc func speak(_ call: CAPPluginCall) {
    guard let value = call.getString("value") else {
      call.error("No value provided")
      return
    }
    
    UIAccessibilityPostNotification(UIAccessibilityAnnouncementNotification, value)
    
    call.success()
  }
}

