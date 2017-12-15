import Foundation

@objc(Console)
public class Console : AVCPlugin {

  @objc public func log(_ call: AVCPluginCall) {
    let message = call.getString("message") ?? ""
    let level = call.getString("level") ?? "LOG"
    print("🥑  [\(level)] - \(message)")
  }
}

