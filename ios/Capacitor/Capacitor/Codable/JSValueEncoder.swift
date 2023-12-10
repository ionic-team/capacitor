//
//  JSValueEncoder.swift
//  Capacitor
//
//  Created by Steven Sherry on 12/8/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

import Foundation
import Combine

/// An encoder than can encode ``JSValue`` objects from `Encodable` types
public final class JSValueEncoder: TopLevelEncoder {
    /// The strategy to use when encoding `nil` values
    public enum OptionalEncodingStrategy {
        /// Encode `nil` values as `NSNull`
        case explicitNulls
        /// Excludes the value from the encoded object altogether
        case undefined
    }

    /// The strategy to use when encoding `nil` values
    public var optionalEncodingStrategy: OptionalEncodingStrategy

    /// Creates a new `JSValueEncoder`
    /// - Parameter optionalEncodingStrategy: The strategy to use when encoding `nil` values
    public init(optionalEncodingStrategy: OptionalEncodingStrategy = .undefined) {
        self.optionalEncodingStrategy = optionalEncodingStrategy
    }

    /// Encodes an `Encodable` value to a ``JSValue``
    /// - Parameter value: The value to encode to ``JSValue``
    /// - Returns: The encoded ``JSValue``
    /// - Throws: An error if the value could not be encoded as a ``JSValue``
    ///
    /// An error may be thrown if the value is a class type. Classes are currently unsupported.
    public func encode<T>(_ value: T) throws -> JSValue where T : Encodable {
        if type(of: value) is AnyObject.Type { throw ClassEncodingUnsupported() }
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        try value.encode(to: encoder)
        guard let value = encoder.data else {
            throw EncodingError.invalidValue(
                value,
                .init(codingPath: encoder.codingPath, debugDescription: "\(value) was unable to be encoded as a JSValue")
            )
        }

        return value
    }

    /// Encodes an `Encodable` value to a ``JSObject``
    /// - Parameter value: The value to encode to a ``JSObject``
    /// - Returns: The encoded ``JSObject``
    /// - Throws: An error if the value could not be encoded as a ``JSObject``
    ///
    /// This method is a convenience method for encoding an `Encodable` value to a ``JSObject``.
    /// It is equivalent to calling ``encode(_:)`` and casting the result to a ``JSObject`` and
    /// throwing an error if the cast fails.
    public func encodeJSObject<T>(_ value: T) throws -> JSObject where T : Encodable {
        guard let object = try encode(value) as? JSObject else {
            throw EncodingError.invalidValue(
                value,
                .init(codingPath: [], debugDescription: "\(value) was unable to be encoded as a JSObject")
            )
        }

        return object
    }
}

fileprivate protocol JSValueEncodingContainer: AnyObject {
    var data: JSValue? { get }
}

fileprivate final class _JSValueEncoder {
    var codingPath: [CodingKey] = []
    var data: JSValue? {
        container?.data
    }

    let optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy

    var userInfo: CodingUserInfo = [:]
    fileprivate var container: (any JSValueEncodingContainer)?

    init(optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy) {
        self.optionalEncodingStrategy = optionalEncodingStrategy
    }
}

extension _JSValueEncoder: Encoder {
    func container<Key>(keyedBy type: Key.Type) -> KeyedEncodingContainer<Key> where Key : CodingKey {
        let container = KeyedContainer<Key>(codingPath: codingPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy)
        self.container = container
        return KeyedEncodingContainer(container)
    }

    func unkeyedContainer() -> UnkeyedEncodingContainer {
        let container = UnkeyedContainer(codingPath: codingPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy)
        self.container = container
        return container
    }

    func singleValueContainer() -> SingleValueEncodingContainer {
        let container = SingleValueContainer(codingPath: codingPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy)
        self.container = container
        return container
    }
}

extension _JSValueEncoder {
    fileprivate final class KeyedContainer<Key> where Key: CodingKey {
        var object: JSObject?
        var codingPath: [CodingKey]
        var userInfo: CodingUserInfo
        var optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy

        init(codingPath: [CodingKey], userInfo: CodingUserInfo, optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy) {
            self.codingPath = codingPath
            self.userInfo = userInfo
            self.optionalEncodingStrategy = optionalEncodingStrategy
        }
    }

}

extension _JSValueEncoder.KeyedContainer: KeyedEncodingContainerProtocol {
    func insert(_ value: JSValue, for key: Key) {
        dump(key)
        if object == nil {
            object = [key.stringValue: value]
        } else {
            object![key.stringValue] = value
        }
    }

    func encodeNil(forKey key: Key) throws {
        insert(NSNull(), for: key)
    }


    func encode<T>(_ value: T, forKey key: Key) throws where T : Encodable {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        try value.encode(to: encoder)
        guard let data = encoder.data else {
            throw EncodingError.invalidValue(value, .init(codingPath: codingPath, debugDescription: "\(value) was unable to be encoded as a JSValue"))
        }
        insert(data, for: key)
    }

    func _encodeIfPresent<T>(_ value: T?, forKey key: Key) throws where T : Encodable {
        switch optionalEncodingStrategy {
        case .explicitNulls:
            if let value = value {
                try encode(value, forKey: key)
            } else {
                try encodeNil(forKey: key)
            }
        case .undefined:
            guard let value = value else { return }
            try encode(value, forKey: key)
        }
    }

    func encodeIfPresent<T>(_ value: T?, forKey key: Key) throws where T : Encodable {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: Bool?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: String?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: Double?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: Float?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: Int?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: Int8?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: Int16?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: Int32?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: Int64?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: UInt?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: UInt8?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: UInt16?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: UInt32?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func encodeIfPresent(_ value: UInt64?, forKey key: Key) throws {
        try _encodeIfPresent(value, forKey: key)
    }

    func nestedContainer<NestedKey>(keyedBy keyType: NestedKey.Type, forKey key: Key) -> KeyedEncodingContainer<NestedKey> where NestedKey : CodingKey {
        var newPath = codingPath
        newPath.append(key)
        return KeyedEncodingContainer(_JSValueEncoder.KeyedContainer<NestedKey>.init(codingPath: newPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy))
    }

    func nestedUnkeyedContainer(forKey key: Key) -> UnkeyedEncodingContainer {
        var newPath = codingPath
        newPath.append(key)
        return _JSValueEncoder.UnkeyedContainer(codingPath: codingPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy)
    }

    func superEncoder() -> Encoder {
        fatalError("Classes are not supported by JSValueEncoder.")
    }

    func superEncoder(forKey key: Key) -> Encoder {
        fatalError("Classes are not supported by JSValueEncoder.")
    }
}

extension _JSValueEncoder.KeyedContainer: JSValueEncodingContainer {
    var data: JSValue? { object }
}

extension _JSValueEncoder {
    fileprivate final class UnkeyedContainer {
        var array: JSArray?
        var codingPath: [CodingKey]
        var userInfo: CodingUserInfo
        var optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy

        init(codingPath: [CodingKey], userInfo: CodingUserInfo, optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy) {
            self.codingPath = codingPath
            self.userInfo = userInfo
            self.optionalEncodingStrategy = optionalEncodingStrategy
        }
    }
}

extension _JSValueEncoder.UnkeyedContainer: UnkeyedEncodingContainer {
    private func append(_ value: any JSValue) {
        if array == nil {
            array = [value]
        } else {
            array!.append(value)
        }
    }

    var count: Int {
        array?.count ?? 0
    }

    func encodeNil() throws {
        append(NSNull())
    }

    func encode<T>(_ value: T) throws where T : Encodable {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        try value.encode(to: encoder)
        guard let value = encoder.data else {
            throw EncodingError.jsEncodingFailed(codingPath: codingPath, value: value)
        }
        append(value)
    }

    func nestedUnkeyedContainer() -> UnkeyedEncodingContainer {
        _JSValueEncoder.UnkeyedContainer(codingPath: codingPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy)
    }

    func nestedContainer<NestedKey>(keyedBy keyType: NestedKey.Type) -> KeyedEncodingContainer<NestedKey> where NestedKey : CodingKey {
        KeyedEncodingContainer(_JSValueEncoder.KeyedContainer(codingPath: codingPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy))
    }

    func superEncoder() -> Encoder {
        fatalError("Classes are not supported by JSValueEncoder.")
    }
}

extension _JSValueEncoder.UnkeyedContainer: JSValueEncodingContainer {
    var data: JSValue? { array }
}

extension _JSValueEncoder {
    fileprivate final class SingleValueContainer {
        var data: JSValue?
        var codingPath: [CodingKey]
        var userInfo: CodingUserInfo
        var optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy

        init(
            codingPath: [CodingKey],
            userInfo: CodingUserInfo,
            optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy
        ) {
            self.codingPath = codingPath
            self.userInfo = userInfo
            self.optionalEncodingStrategy = optionalEncodingStrategy
        }
    }
}

extension _JSValueEncoder.SingleValueContainer: SingleValueEncodingContainer {
    func encodeNil() throws {
        data = NSNull()
    }

    func encode(_ value: Bool) throws {
        data = value
    }

    func encode(_ value: String) throws {
        data = value
    }

    func encode(_ value: Double) throws {
        data = value as NSNumber
    }

    func encode(_ value: Float) throws {
        data = value as NSNumber
    }

    func encode(_ value: Int) throws {
        data = value as NSNumber
    }

    func encode(_ value: Int8) throws {
        data = value as NSNumber
    }

    func encode(_ value: Int16) throws {
        data = value as NSNumber
    }

    func encode(_ value: Int32) throws {
        data = value as NSNumber
    }

    func encode(_ value: Int64) throws {
        data = value as NSNumber
    }

    func encode(_ value: UInt) throws {
        data = value as NSNumber
    }

    func encode(_ value: UInt8) throws {
        data = value as NSNumber
    }

    func encode(_ value: UInt16) throws {
        data = value as NSNumber
    }

    func encode(_ value: UInt32) throws {
        data = value as NSNumber
    }

    func encode(_ value: UInt64) throws {
        data = value as NSNumber
    }

    func encode<T>(_ value: T) throws where T : Encodable {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        try value.encode(to: encoder)
        data = encoder.data
    }
}

extension _JSValueEncoder.SingleValueContainer: JSValueEncodingContainer {}

extension EncodingError {
    static func jsEncodingFailed(codingPath: [CodingKey], value: Any) -> EncodingError {
        EncodingError.invalidValue(
            value,
            .init(
                codingPath: codingPath,
                debugDescription: "\(value) was unable to be encoded as JSValue"
            )
        )
    }
}
