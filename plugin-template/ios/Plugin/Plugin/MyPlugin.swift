import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitor.ionicframework.com/docs/ios/plugins
 *
 * Important: the name of your plugin class *must* be globally unique to the Capacitor
 * ecosystem!
 */
@objc(MyPlugin)
public class MyPlugin : CAPPlugin {
    
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.success([
            "value": value
        ])
    }
}
