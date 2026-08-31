import Foundation

@objc(CAPHttpPlugin)
public class CAPHttpPlugin: CAPPlugin, CapacitorPlugin {
    public let identifier = "CAPHttpPlugin"
    public let jsName = "CapacitorHttp"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "request", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "post", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "put", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "patch", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "delete", returnType: CAPPluginReturnPromise)
    ]

    public var methodHandlers: [String: (CAPPluginCall) async throws -> Void] {
        [
            "request": { try self.http($0, nil) },
            "get": { try self.http($0, "GET") },
            "post": { try self.http($0, "POST") },
            "put": { try self.http($0, "PUT") },
            "patch": { try self.http($0, "PATCH") },
            "delete": { try self.http($0, "DELETE") }
        ]
    }

    func http(_ call: CAPPluginCall, _ httpMethod: String?) throws {
        if let clazz = NSClassFromString("SSLPinningHttpRequestHandlerClass") {
            // swiftlint:disable force_cast
            (clazz as! NSObject.Type).perform(NSSelectorFromString("request:"), with: [
                "call": call,
                "httpMethod": httpMethod as Any,
                "config": self.bridge?.config as Any
            ])
            // swiftlint:enable force_cast
        } else {
            try HttpRequestHandler.request(call, httpMethod, self.bridge?.config)
        }
    }
}
