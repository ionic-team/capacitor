//
//  CAPMessageHandlerWrapper.swift
//

import Foundation
import WebKit

public class CAPMessageHandlerWrapper: NSObject, WKScriptMessageHandler {
    weak var bridge: CAPBridge?
    fileprivate(set) var contentController = WKUserContentController()
    let handlerName = "bridge"
    
    public init(bridge: CAPBridge? = nil) {
        super.init()
        self.bridge = bridge
        contentController.add(self, name: handlerName)
    }
    
    func cleanUp() {
        contentController.removeScriptMessageHandler(forName: handlerName)
    }
    
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let bridge = bridge else {
          return
        }
        bridge.bridgeDelegate?.userContentController(userContentController, didReceive: message, bridge: bridge)
    }
}
