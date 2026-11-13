//
//  CAPPluginMethod.swift
//  Capacitor
//
//  Created by Steven Sherry on 4/18/24.
//  Copyright © 2024 Drifty Co. All rights reserved.
//

extension CAPPluginMethod {
    public enum ReturnType: String {
        case promise, callback, none
    }

    public convenience init(_ selector: Selector, returnType: ReturnType = .promise) {
        self.init(selector: selector, returnType: returnType.rawValue)
    }
}
