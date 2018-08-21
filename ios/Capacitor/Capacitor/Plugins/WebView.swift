import Foundation

@objc(CAPWebViewPlugin)
public class CAPWebViewPlugin : CAPPlugin {

  @objc func setServerBasePath(_ call: CAPPluginCall) {
    let path = call.getString("path")
    let vc = bridge.viewController as! CAPBridgeViewController
    vc.setServerBasePath(path: path!)
    call.success()
  }

  @objc func getServerBasePath(_ call: CAPPluginCall) {
    let vc = bridge.viewController as! CAPBridgeViewController
    let path = vc.getServerBasePath()
    call.success([
      "path": path
    ])
  }

  @objc func persistServerBasePath(_ call: CAPPluginCall) {
    let vc = bridge.viewController as! CAPBridgeViewController
    let path = vc.getServerBasePath()
    let defaults = UserDefaults.standard
    defaults.set(path, forKey: "serverBasePath")
    call.success()
  }
}
