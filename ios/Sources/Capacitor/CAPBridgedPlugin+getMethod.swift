//
//  CAPBridgedPlugin+getMethod.swift
//  Capacitor
//
//  Created by Steven Sherry on 3/1/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

extension CAPBridgedPlugin {
    func getMethod(named name: String) -> CAPPluginMethod? {
        pluginMethods.first { $0.name == name }
    }
}
