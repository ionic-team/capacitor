import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(CLASS_NAME)
public class CLASS_NAME: CAPPlugin {
// swiftlint:disable:previous type_name
    private let functionality = CLASS_NAMEFunctionality()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.success([
            "value": functionality.echo(value)
        ])
    }
}
