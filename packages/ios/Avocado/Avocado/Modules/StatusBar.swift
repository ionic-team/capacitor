import Foundation

/**
 * StatusBar plugin. Requires "View controller-based status bar appearance" to
 * be "NO" in Info.plist
 */
@objc(StatusBar)
public class StatusBar: Plugin {
  @objc public func setStyle(_ call: PluginCall) {
    let options = call.options

    if let style = options["style"] as? String {
      if style == "DARK" {
        UIApplication.shared.statusBarStyle = .lightContent
      } else if style == "LIGHT" {
        UIApplication.shared.statusBarStyle = .default
      }
    }
    
    call.successCallback(PluginResult([:]))
  }
}
