import Foundation

@objc(CAPWebViewPlugin)
public class CAPWebViewPlugin: CAPPlugin {

    @objc func setServerBasePath(_ call: CAPPluginCall) {
        if let path = call.getString("path"), let viewController = bridge?.viewController as? CAPBridgeViewController {
            viewController.setServerBasePath(path: path)
            call.resolve()
        }
    }

    @objc func getServerBasePath(_ call: CAPPluginCall) {
        if let viewController = bridge?.viewController as? CAPBridgeViewController {
            let path = viewController.getServerBasePath()
            call.resolve([
                "path": path
            ])
        }
    }

    @objc func persistServerBasePath(_ call: CAPPluginCall) {
        if let viewController = bridge?.viewController as? CAPBridgeViewController {
            let path = viewController.getServerBasePath()
            let defaults = UserDefaults.standard
            defaults.set(path, forKey: "serverBasePath")
            call.resolve()
        }
    }
}
