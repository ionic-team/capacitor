import Foundation

@objc(Console)
public class Console : CAPPlugin {

  @objc public func log(_ call: CAPPluginCall) {
    let message = call.getString("message") ?? ""
    let level = call.getString("level") ?? "LOG"
    print("⚡️  [\(level)] - \(message)")
  }
}

