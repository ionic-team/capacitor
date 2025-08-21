import Foundation

@objc(CAPConsolePlugin)
public class CAPConsolePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPConsolePlugin"
    public let jsName = "Console"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "log", returnType: CAPPluginReturnNone)
    ]

    @objc public func log(_ call: CAPPluginCall) {
        let logger = CapacitorLogger(category: "Console")
        let message = call.getString("message") ?? ""
        let levelString = call.getString("level") ?? "log"
        let level = CapacitorLogLevel(string: levelString)
        logger.log(message: "[\(levelString)]: \(message)", level: level)
    }
}
