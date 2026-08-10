//
//  CAPPluginMethod.swift
//  Capacitor
//
//  Created by Steven Sherry on 4/18/24.
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import Foundation

public typealias CAPPluginReturnType = String

public let CAPPluginReturnNone: CAPPluginReturnType = "none"
public let CAPPluginReturnCallback: CAPPluginReturnType = "callback"
public let CAPPluginReturnPromise: CAPPluginReturnType = "promise"

@objc public enum CAPPluginMethodArgumentNullability: Int {
    case notNullable = 0
    case nullable = 1
}

@objc open class CAPPluginMethodArgument: NSObject {
    @objc public var name: String
    @objc public var nullability: CAPPluginMethodArgumentNullability
    @objc public var type: String

    @objc public init(name: String, nullability: CAPPluginMethodArgumentNullability, type: String) {
        self.name = name
        self.nullability = nullability
        self.type = type
        super.init()
    }
}

@objc open class CAPPluginMethod: NSObject {
    @objc public var selector: Selector
    @objc public var name: String
    @objc public var returnType: CAPPluginReturnType

    @objc public init(name: String, returnType: CAPPluginReturnType) {
        self.name = name
        self.selector = Selector(name + ":")
        self.returnType = returnType
        super.init()
    }

    @objc public init(selector: Selector, returnType: CAPPluginReturnType) {
        let selectorString = NSStringFromSelector(selector)
        self.name = String(selectorString.dropLast())
        self.selector = selector
        self.returnType = returnType
        super.init()
    }
}

// MARK: - Convenience Helpers

extension CAPPluginMethod {
    public enum ReturnType: String {
        case promise, callback, none
    }

    public convenience init(_ selector: Selector, returnType: ReturnType = .promise) {
        self.init(selector: selector, returnType: returnType.rawValue)
    }
}
