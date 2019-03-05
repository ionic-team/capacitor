import Foundation

/**
 * StatusBar plugin. Requires "View controller-based status bar appearance" to
 * be "YES" in Info.plist
 */
@objc(CAPStatusBarPlugin)
public class CAPStatusBarPlugin: CAPPlugin {

  public override func load() {
    NotificationCenter.default.addObserver(forName: CAPBridge.statusBarTappedNotification.name, object: .none, queue: .none) { _ in
      self.bridge.triggerJSEvent(eventName: "statusTap", target: "window")
    }
  }

  @objc func setStyle(_ call: CAPPluginCall) {
    let options = call.options!

    if let style = options["style"] as? String {
      if style == "DARK" {
        bridge.setStatusBarStyle(.lightContent)
      } else if style == "LIGHT" {
        bridge.setStatusBarStyle(.default)
      }
    }
    
    call.success([:])
  }
  
  @objc func setBackgroundColor(_ call: CAPPluginCall) {
    call.unimplemented()
  }
  
  @objc func hide(_ call: CAPPluginCall) {
    bridge.setStatusBarVisible(false)
    call.success()
  }
  
  @objc func show(_ call: CAPPluginCall) {
    bridge.setStatusBarVisible(true)
    call.success()
  }

  @objc func getInfo(_ call: CAPPluginCall) {
    let style: String
    if bridge.getStatusBarStyle() == .default {
      style = "LIGHT"
    } else {
      style = "DARK"
    }
    call.success([
      "visible": bridge.getStatusBarVisible(),
      "style": style
    ])
  }
}

