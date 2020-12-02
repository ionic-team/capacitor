//
//  CAPMessageHandlerWrapper.swift
//

import Foundation
import WebKit

internal class CAPMessageHandlerWrapper: NSObject, WKScriptMessageHandler {
    weak var bridge: CapacitorBridge?
    fileprivate(set) var contentController = WKUserContentController()
    let handlerName = "bridge"

    init(bridge: CapacitorBridge? = nil) {
        super.init()
        self.bridge = bridge
        contentController.add(self, name: handlerName)
    }

    func cleanUp() {
        contentController.removeScriptMessageHandler(forName: handlerName)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let bridge = bridge else {
            return
        }
        bridge.bridgeDelegate?.userContentController(userContentController, didReceive: message, bridge: bridge)
    }
}
