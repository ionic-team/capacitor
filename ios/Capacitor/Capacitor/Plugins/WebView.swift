import Foundation

@objc(CAPWebViewPlugin)
public class CAPWebViewPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPWebViewPlugin"
    public let jsName = "WebView"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setServerAssetPath", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setServerBasePath", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getServerBasePath", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "persistServerBasePath", returnType: CAPPluginReturnPromise)
    ]

    @objc func setServerAssetPath(_ call: CAPPluginCall) {
        if let path = call.getString("path"), let viewController = bridge?.viewController as? CAPBridgeViewController {
            viewController.setServerBasePath(path: Bundle.main.url(forResource: path, withExtension: nil)?.path ?? path)
            call.resolve()
        }
    }

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
            KeyValueStore.standard["serverBasePath"] = path
            call.resolve()
        }
    }
}
