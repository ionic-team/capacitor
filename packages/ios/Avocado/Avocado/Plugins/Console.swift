import Foundation

public class Console : Plugin {

  @objc public func log(_ call: PluginCall) {
    let data = call.options
    let message = data["message"] ?? ""
    let level = data["level"] ?? "LOG"
    print("[\(level)] \(self.pluginId) - \(message)")
  }
}

