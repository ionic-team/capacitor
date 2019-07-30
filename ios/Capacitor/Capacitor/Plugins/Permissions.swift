import Foundation

/**
 * Implement three common modal types: alert, confirm, and prompt
 */
@objc(CAPPermissionsPlugin)
public class CAPPermissionsPlugin: CAPPlugin {
  @objc public override func hasPermission(_ call: CAPPluginCall) {
    guard let pluginName = call.getString("plugin") else {
      call.reject("Must provide a permission to check")
      return
    }
    
    guard let plugin = bridge.getPlugin(pluginName: pluginName) else {
      call.reject("Unable to find plugin")
      return
    }
    
    plugin.hasPermission(call)
  }
}
