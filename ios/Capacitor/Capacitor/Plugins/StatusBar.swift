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
        if #available(iOS 13.0, *) {
          // TODO - use .darkContent instead of rawValue once Xcode 10 support is dropped
          bridge.setStatusBarStyle(UIStatusBarStyle.init(rawValue: 3) ?? .default)
        } else {
          bridge.setStatusBarStyle(.default)
        }
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
    DispatchQueue.main.async {
      let style: String
      if #available(iOS 13.0, *) {
        switch self.bridge.getStatusBarStyle() {
        case .default:
          if self.bridge.getUserInterfaceStyle() == UIUserInterfaceStyle.dark {
            style = "DARK"
          } else {
            style = "LIGHT"
          }
        case .lightContent:
          style = "DARK"
        default:
          style = "LIGHT"
        }
      } else {
        if self.bridge.getStatusBarStyle() == .lightContent {
          style = "DARK"
        } else {
          style = "LIGHT"
        }
      }

      call.success([
        "visible": self.bridge.getStatusBarVisible(),
        "style": style
      ])
    }
  }
}

