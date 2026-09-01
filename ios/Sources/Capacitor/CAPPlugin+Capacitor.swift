import Foundation
import UIKit

@objc public extension CAPPlugin {
    /// The bridge that owns this plugin. Backed by the untyped `bridgeRef` storage on the
    /// Objective-C `CAPPlugin` so that the `CapacitorObjC` target never references the
    /// Swift-defined `CAPBridgeProtocol` (which would create a cross-module reference cycle).
    var bridge: CAPBridgeProtocol? {
        get { bridgeRef as? CAPBridgeProtocol }
        set { bridgeRef = newValue as? NSObject }
    }

    convenience init(bridge: CAPBridgeProtocol, pluginId: String, pluginName: String) {
        self.init()
        self.bridge = bridge
        self.webView = bridge.webView
        self.pluginId = pluginId
        self.pluginName = pluginName
    }

    func getConfig() -> PluginConfig {
        guard let bridge = bridge else { return PluginConfig(config: [:]) }
        return bridge.config.getPluginConfig(pluginName)
    }

    func removeListener(_ call: CAPPluginCall) {
        guard let eventName = call.options["eventName"] as? String,
              let callbackId = call.options["callbackId"] as? String else {
            return
        }

        guard let storedCall = bridge?.savedCall(withID: callbackId) else {
            return
        }

        removeEventListener(eventName, listener: storedCall)
        bridge?.releaseCall(withID: callbackId)
    }

    func setCenteredPopover(_ vc: UIViewController) {
        guard let viewController = bridge?.viewController else {
            return
        }

        let popover = vc.popoverPresentationController
        popover?.sourceRect = CGRect(
            x: viewController.view.center.x,
            y: viewController.view.center.y,
            width: 0,
            height: 0
        )
        popover?.sourceView = viewController.view
        popover?.permittedArrowDirections = []
    }

    func setCenteredPopover(_ vc: UIViewController, size: CGSize) {
        guard let viewController = bridge?.viewController else {
            return
        }

        vc.preferredContentSize = size
        let popover = vc.popoverPresentationController
        popover?.sourceRect = CGRect(
            x: viewController.view.center.x,
            y: viewController.view.center.y,
            width: 0,
            height: 0
        )
        popover?.sourceView = viewController.view
        popover?.permittedArrowDirections = []
    }

    func getBool(_ call: CAPPluginCall, field: String, defaultValue: Bool) -> Bool {
        let value = call.getNumber(field, defaultValue: NSNumber(value: defaultValue))
        return value?.boolValue ?? defaultValue
    }

    func getString(_ call: CAPPluginCall, field: String, defaultValue: String) -> String {
        return call.getString(field, defaultValue: defaultValue) ?? defaultValue
    }
}
