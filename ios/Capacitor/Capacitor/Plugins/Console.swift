import Foundation

@objc(CAPConsolePlugin)
public class CAPConsolePlugin: CAPPlugin {

    @objc public func log(_ call: CAPPluginCall) {
        let message = call.getString("message") ?? ""
        let level = call.getString("level") ?? "log"
        CAPLog.print("⚡️  [\(level)] - \(message)")
    }
}
