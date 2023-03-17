//
//  CAPPlugin+LoadInstance.swift
//  Capacitor
//
//  Created by Steven Sherry on 11/9/22.
//  Copyright © 2022 Drifty Co. All rights reserved.
//

extension CAPPlugin {
    func load(as bridgedType: CAPBridgedPlugin.Type, on bridge: CAPBridgeProtocol) {
        self.bridge = bridge
        webView = bridge.webView
        pluginId = bridgedType.pluginId()
        pluginName = bridgedType.jsName()
        shouldStringifyDatesInCalls = true
        retainedEventArguments = [:]
        load()
    }
}
