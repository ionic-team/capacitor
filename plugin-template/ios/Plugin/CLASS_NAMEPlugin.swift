import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(CLASS_NAMEPlugin)
public class CLASS_NAMEPlugin: CAPPlugin {
// swiftlint:disable:previous type_name
    private let implementation = CLASS_NAME()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.success([
            "value": implementation.echo(value)
        ])
    }
}
