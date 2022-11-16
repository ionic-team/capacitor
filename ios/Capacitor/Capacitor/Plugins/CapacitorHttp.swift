import Foundation

@objc(CAPHttpPlugin)
public class CAPHttpPlugin: CAPPlugin {
    @objc func http(_ call: CAPPluginCall, _ httpMethod: String?) {
        // Protect against bad values from JS before calling request
        guard let url = call.getString("url") else { return call.reject("Must provide a URL"); }
        guard var _ = URL(string: url) else { return call.reject("Invalid URL"); }

        do {
            try HttpRequestHandler.request(call, httpMethod, self.bridge?.config)
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

    @objc func del(_ call: CAPPluginCall) {
        http(call, "DELETE")
    }
}
