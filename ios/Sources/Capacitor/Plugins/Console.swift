import Foundation

@objc(CAPConsolePlugin)
public class CAPConsolePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPConsolePlugin"
    public let jsName = "Console"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "log", returnType: CAPPluginReturnNone)
    ]

    @objc public func log(_ call: CAPPluginCall) {
        let message = call.getString("message") ?? ""
        let level = call.getString("level") ?? "log"
        CAPLog.print("⚡️  [\(level)] - \(message)")
    }
}
