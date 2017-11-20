import Foundation

public class Console : Plugin {
  public init(_ avocado: Avocado) {
    super.init(avocado, id: "com.avocadojs.plugin.console")
  }

  @objc public func log(_ call: PluginCall) {
    let data = call.options
    let message = data["message"] ?? ""
    let level = data["level"] ?? "LOG"
    print("[\(level) ] \(self.pluginId) - \(message)")
  }
}

