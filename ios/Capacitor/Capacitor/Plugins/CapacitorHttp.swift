import Foundation

@objc(CAPHttpPlugin)
public class CAPHttpPlugin: CAPPlugin, CAPBridgedPlugin {
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

    @objc func http(_ call: CAPPluginCall, _ httpMethod: String?) {
        do {
            if let clazz = NSClassFromString("SSLPinningHttpRequestHandlerClass") {
                // swiftlint:disable force_cast
                (clazz as! NSObject.Type).perform(#selector(self.request(_:)), with: [
                    "call": call,
                    "httpMethod": httpMethod as Any,
                    "config": self.bridge?.config as Any
                ])
                // swiftlint:enable force_cast
            } else {
                try HttpRequestHandler.request(call, httpMethod, self.bridge?.config)
            }
        } catch let error {
            call.reject(error.localizedDescription)
        }
    }

    @objc func request(_ call: CAPPluginCall) {
        http(call, nil)
    }

    @objc func get(_ call: CAPPluginCall) {
        http(call, "GET")
    }

    @objc func post(_ call: CAPPluginCall) {
        http(call, "POST")
    }

    @objc func put(_ call: CAPPluginCall) {
        http(call, "PUT")
    }

    @objc func patch(_ call: CAPPluginCall) {
        http(call, "PATCH")
    }

    @objc func delete(_ call: CAPPluginCall) {
        http(call, "DELETE")
    }
}
