import Foundation
import SafariServices

@objc(CAPAccessibilityPlugin)
public class CAPAccessibilityPlugin: CAPPlugin {
  static let screenReaderStateChangeEvent = "accessibilityScreenReaderStateChange"
  override public func load() {
    NotificationCenter.default.addObserver(self,
                                           selector: #selector(self.onScreenReaderStateChanged(notification:)),
                                           name: UIAccessibility.voiceOverStatusDidChangeNotification,
                                           object: nil)
  }

  @objc func onScreenReaderStateChanged(notification: NSNotification) {
    notifyListeners(CAPAccessibilityPlugin.screenReaderStateChangeEvent, data: [
      "value": UIAccessibility.isVoiceOverRunning
    ])
  }

  @objc func isScreenReaderEnabled(_ call: CAPPluginCall) {
    let voEnabled = UIAccessibility.isVoiceOverRunning
    call.success([
      "value": voEnabled
    ])
  }

  @objc func speak(_ call: CAPPluginCall) {
    guard let value = call.getString("value") else {
      call.error("No value provided")
      return
    }

    UIAccessibility.post(notification: UIAccessibility.Notification.announcement, argument: value)

    call.success()
  }
}
