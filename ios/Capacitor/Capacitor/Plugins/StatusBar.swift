import Foundation

/**
 * StatusBar plugin. Requires "View controller-based status bar appearance" to
 * be "YES" in Info.plist
 */
@objc(CAPStatusBarPlugin)
public class CAPStatusBarPlugin: CAPPlugin {
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
    // noop on iOS
    call.success()
  }
  
  @objc func hide(_ call: CAPPluginCall) {
    bridge.setStatusBarVisible(false)
    call.success()
  }
  
  @objc func show(_ call: CAPPluginCall) {
    bridge.setStatusBarVisible(true)
    call.success()
  }
}

