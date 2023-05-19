//
//  CAPPlugin+LoadInstance.swift
//  Capacitor
//
//  Created by Steven Sherry on 11/9/22.
//  Copyright © 2022 Drifty Co. All rights reserved.
//

extension CAPBridgedPlugin where Self: CAPPlugin {
    func load(on bridge: CAPBridgeProtocol) {
        self.bridge = bridge
        webView = bridge.webView
        shouldStringifyDatesInCalls = true
        retainedEventArguments = [:]
        eventListeners = [:]
        pluginId = identifier
        pluginName = jsName
        load()
    }
}
