import Foundation
import WebKit
import UIKit

@objc open class CAPPlugin: NSObject {
    @objc public weak var webView: WKWebView?
    @objc public weak var bridge: CAPBridgeProtocol?
    @objc public var pluginId: String = ""
    @objc public var pluginName: String = ""
    @objc public var eventListeners: NSMutableDictionary = [:]
    @objc public var retainedEventArguments: NSMutableDictionary = [:]
    @objc public var shouldStringifyDatesInCalls = true

    @objc public init(bridge: CAPBridgeProtocol, pluginId: String, pluginName: String) {
        super.init()
        self.bridge = bridge
        self.webView = bridge.webView
        self.pluginId = pluginId
        self.pluginName = pluginName
        self.eventListeners = NSMutableDictionary()
        self.retainedEventArguments = NSMutableDictionary()
        self.shouldStringifyDatesInCalls = true
    }

    @objc public func getId() -> String {
        return pluginName
    }

    @objc public func getBool(_ call: CAPPluginCall, field: String, defaultValue: Bool) -> Bool {
        let value = call.getNumber(field, defaultValue: NSNumber(value: defaultValue))
        return value?.boolValue ?? defaultValue
    }

    @objc public func getString(_ call: CAPPluginCall, field: String, defaultValue: String) -> String {
        return call.getString(field, defaultValue: defaultValue) ?? defaultValue
    }

    @objc public func getConfig() -> PluginConfig? {
        guard let bridge = bridge else { return nil }
        return bridge.config.getPluginConfig(pluginName)
    }

    @objc open func load() {
    }

    @objc public func addEventListener(_ eventName: String, listener: CAPPluginCall) {
        var listenersForEvent = eventListeners.object(forKey: eventName) as? NSMutableArray

        if listenersForEvent == nil || listenersForEvent?.count == 0 {
            listenersForEvent = NSMutableArray(object: listener)
            eventListeners.setValue(listenersForEvent, forKey: eventName)
            sendRetainedArguments(forEvent: eventName)
        } else {
            listenersForEvent?.add(listener)
        }
    }

    @objc public func removeEventListener(_ eventName: String, listener: CAPPluginCall) {
        guard let listenersForEvent = eventListeners.object(forKey: eventName) as? NSMutableArray else {
            return
        }

        let listenerIndex = listenersForEvent.index(of: listener)
        guard listenerIndex != NSNotFound else {
            return
        }

        listenersForEvent.removeObject(at: listenerIndex)
    }

    @objc public func notifyListeners(_ eventName: String, data: [String: Any]?) {
        notifyListeners(eventName, data: data, retainUntilConsumed: false)
    }

    @objc public func notifyListeners(_ eventName: String, data: [String: Any]?, retainUntilConsumed: Bool) {
        guard let listenersForEvent = eventListeners.object(forKey: eventName) as? [CAPPluginCall] else {
            if retainUntilConsumed {
                if retainedEventArguments.object(forKey: eventName) == nil {
                    retainedEventArguments.setObject(NSMutableArray(), forKey: eventName)
                }
                (retainedEventArguments.object(forKey: eventName) as? NSMutableArray)?.add(data ?? [:])
            }
            return
        }

        for call in listenersForEvent {
            let result = CAPPluginCallResult(data ?? [:])
            call.successHandler(result, call)
        }
    }

    @objc public func addListener(_ call: CAPPluginCall) {
        guard let eventName = call.options["eventName"] as? String else {
            return
        }
        call.keepAlive = true
        addEventListener(eventName, listener: call)
    }

    @objc public func removeListener(_ call: CAPPluginCall) {
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

    @objc public func removeAllListeners(_ call: CAPPluginCall) {
        eventListeners.removeAllObjects()
        call.resolve()
    }

    @objc public func getListeners(_ eventName: String) -> [CAPPluginCall]? {
        return eventListeners.object(forKey: eventName) as? [CAPPluginCall]
    }

    @objc public func hasListeners(_ eventName: String) -> Bool {
        guard let listeners = eventListeners.object(forKey: eventName) as? NSArray else {
            return false
        }
        return listeners.count > 0
    }

    @objc public func checkPermissions(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc public func requestPermissions(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc public func setCenteredPopover(_ vc: UIViewController) {
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

    @objc public func setCenteredPopover(_ vc: UIViewController, size: CGSize) {
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

    @objc public func supportsPopover() -> Bool {
        return true
    }

    @objc public func shouldOverrideLoad(_ navigationAction: WKNavigationAction) -> NSNumber? {
        return nil
    }

    @objc public func handleWKWebViewURLAuthenticationChallenge(
        _ challenge: NSURLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) -> Bool {
        return false
    }

    private func sendRetainedArguments(forEvent eventName: String) {
        guard let retained = retainedEventArguments.object(forKey: eventName) as? NSMutableArray else {
            return
        }

        retainedEventArguments.removeObject(forKey: eventName)

        for data in retained {
            notifyListeners(eventName, data: data as? [String: Any])
        }
    }
}
