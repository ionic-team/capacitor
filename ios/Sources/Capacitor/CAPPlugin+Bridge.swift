import Foundation
import UIKit
import WebKit

@objc public extension CAPPlugin {
    var bridge: CAPBridgeProtocol? {
        get { return bridgeRef as? CAPBridgeProtocol }
        set { bridgeRef = newValue as? NSObject }
    }

    @available(*, deprecated, message: "This initializer is deprecated and is not suggested for use. Any data set through this init method will be overridden when it is loaded on the bridge.")
    @objc(initWithBridge:pluginId:pluginName:)
    convenience init(bridge: CAPBridgeProtocol, pluginId: String, pluginName: String) {
        self.init()
        self.bridge = bridge
        self.webView = bridge.webView
        self.pluginId = pluginId
        self.pluginName = pluginName
        self.eventListeners = [:]
        self.retainedEventArguments = [:]
        self.shouldStringifyDatesInCalls = true
    }

    @available(*, deprecated, message: "Use accessors on CAPPluginCall instead. See CAPBridgedJSTypes.h for Obj-C implementations.")
    func getBool(_ call: CAPPluginCall, field: String, defaultValue: Bool) -> Bool {
        guard let value = call.options[field] as? NSNumber else { return defaultValue }
        return value.boolValue
    }

    @available(*, deprecated, message: "Use accessors on CAPPluginCall instead. See CAPBridgedJSTypes.h for Obj-C implementations.")
    func getString(_ call: CAPPluginCall, field: String, defaultValue: String) -> String? {
        return call.options[field] as? String ?? defaultValue
    }

    func getConfig() -> PluginConfig {
        return bridge?.config.getPluginConfig(pluginName) ?? PluginConfig(config: JSObject())
    }

    func notifyListeners(_ eventName: String, data: [String: Any]?) {
        notifyListeners(eventName, data: data, retainUntilConsumed: false)
    }

    func notifyListeners(_ eventName: String, data: [String: Any]?, retainUntilConsumed retain: Bool) {
        guard let listenersForEvent = eventListeners?.object(forKey: eventName) as? NSArray,
              listenersForEvent.count > 0 else {
            if retain, let data = data {
                let bucket: NSMutableArray
                if let existing = retainedEventArguments?.object(forKey: eventName) as? NSMutableArray {
                    bucket = existing
                } else {
                    bucket = NSMutableArray()
                    retainedEventArguments?.setObject(bucket, forKey: eventName as NSString)
                }
                bucket.add(data)
            }
            return
        }

        for case let call as CAPPluginCall in listenersForEvent {
            call.successHandler(CAPPluginCallResult(data), call)
        }
    }

    func removeListener(_ call: CAPPluginCall) {
        guard let eventName = call.options["eventName"] as? String,
              let callbackId = call.options["callbackId"] as? String else { return }
        if let storedCall = bridge?.savedCall(withID: callbackId) {
            removeEventListener(eventName, listener: storedCall)
        }
        bridge?.releaseCall(withID: callbackId)
    }

    func removeAllListeners(_ call: CAPPluginCall) {
        eventListeners?.removeAllObjects()
        call.resolve()
    }

    /**
     * Default implementation of the capacitor 3.0 permission pattern
     */
    func checkPermissions(_ call: CAPPluginCall) {
        call.resolve()
    }

    func requestPermissions(_ call: CAPPluginCall) {
        call.resolve()
    }

    /**
     * Configure popover sourceRect, sourceView and permittedArrowDirections to show it centered
     */
    func setCenteredPopover(_ viewController: UIViewController) {
        guard let hostView = bridge?.viewController?.view else { return }
        viewController.popoverPresentationController?.sourceRect = CGRect(x: hostView.center.x, y: hostView.center.y, width: 0, height: 0)
        viewController.popoverPresentationController?.sourceView = hostView
        viewController.popoverPresentationController?.permittedArrowDirections = []
    }

    func setCenteredPopover(_ viewController: UIViewController, size: CGSize) {
        guard let hostView = bridge?.viewController?.view else { return }
        viewController.popoverPresentationController?.sourceRect = CGRect(x: hostView.center.x, y: hostView.center.y, width: 0, height: 0)
        viewController.preferredContentSize = size
        viewController.popoverPresentationController?.sourceView = hostView
        viewController.popoverPresentationController?.permittedArrowDirections = []
    }
}
