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
    public func encode<T>(_ value: T) throws -> JSValue where T: Encodable {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        try value.encode(to: encoder)
        guard let value = encoder.data else {
            throw EncodingError.invalidValue(
                value,
                .init(
                    codingPath: encoder.codingPath,
                    debugDescription: "\(value) was unable to be encoded as a JSValue"
                )
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
    public func encodeJSObject<T>(_ value: T) throws -> JSObject where T: Encodable {
        guard let object = try encode(value) as? JSObject else {
            throw EncodingError.invalidValue(
                value,
                .init(
                    codingPath: [],
                    debugDescription: "\(value) was unable to be encoded as a JSObject"
                )
            )
        }

        return object
    }
}

private protocol JSValueEncodingContainer {
    var data: JSValue? { get }
}

private enum EncodingContainer: JSValueEncodingContainer {
    case singleValue(SingleValueContainer)
    case unkeyed(UnkeyedContainer)
    case keyed(AnyKeyedContainer)

    var data: JSValue? {
        switch self {
        case let .singleValue(container):
            return container.data
        case let .unkeyed(container):
            return container.data
        case let .keyed(container):
            return container.data
        }
    }

    var type: String {
        switch self {
        case .singleValue:
            "SingleValueContainer"
        case .unkeyed:
            "UnkeyedContainer"
        case .keyed:
            "KeyedContainer"
        }
    }
}

private final class _JSValueEncoder: JSValueEncodingContainer {
    var codingPath: [CodingKey] = []
    var data: JSValue? {
        containers.data
    }

    let optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy

    var userInfo: CodingUserInfo = [:]
    fileprivate var containers: [EncodingContainer] = []

    init(optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy) {
        self.optionalEncodingStrategy = optionalEncodingStrategy
    }
}

extension Array: JSValueEncodingContainer where Element == EncodingContainer {
    var data: JSValue? {
        guard count != 0 else { return nil }
        guard count != 1 else { return self[0].data }
        var data: (any JSValue)?

        for container in self {
            if data == nil {
                data = container.data
            } else {
                // The top-level container is
                switch container {
                case let .keyed(container):
                    guard let obj = data as? JSObject else { break }
                    data = obj.merging(container.object() ?? [:]) { $1 }
                case let .unkeyed(container):
                    guard var copy = data as? JSArray else { break }
                    copy.append(contentsOf: container.array ?? [])
                    data = copy
                default:
                    break
                }
            }
        }

        return data
    }
}

private enum EncodedValue {
    case value(any JSValue)
    case nestedContainer(any JSValueEncodingContainer)
}

extension _JSValueEncoder: Encoder {
    func addContainer(_ container: EncodingContainer) {
        guard !containers.isEmpty else {
            containers.append(container)
            return
        }

        for existingContainer in containers {
            switch (existingContainer, container) {
            case (.unkeyed, .unkeyed), (.keyed, .keyed):
                containers.append(container)
            default:
                preconditionFailure("Sibling top-level containers must be of the same type. Attempted to add a \(container)")
            }
        }
    }

    func container<Key>(keyedBy type: Key.Type) -> KeyedEncodingContainer<Key> where Key: CodingKey {
        let container = KeyedContainer<Key>(codingPath: codingPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy)
        addContainer(.keyed(.init(container)))
        return KeyedEncodingContainer(container)
    }

    func unkeyedContainer() -> UnkeyedEncodingContainer {
        let container = UnkeyedContainer(codingPath: codingPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy)
        addContainer(.unkeyed(container))
        return container
    }

    func singleValueContainer() -> SingleValueEncodingContainer {
        let container = SingleValueContainer(codingPath: codingPath, userInfo: userInfo, optionalEncodingStrategy: optionalEncodingStrategy)
        addContainer(.singleValue(container))
        return container
    }
}

private final class KeyedContainer<Key> where Key: CodingKey {
    var object: JSObject? {
        encodedKeyedValue?.reduce(into: [:]) { obj, next in
            let (key, value) = next
            switch value {
            case .value(let value):
                obj[key] = value
            case .nestedContainer(let container):
                obj[key] = container.data
            }
        }
    }

    var codingPath: [CodingKey]
    var userInfo: CodingUserInfo
    var optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy
    private var encodedKeyedValue: [String: EncodedValue]?

    init(codingPath: [CodingKey], userInfo: CodingUserInfo, optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy) {
        self.codingPath = codingPath
        self.userInfo = userInfo
        self.optionalEncodingStrategy = optionalEncodingStrategy
    }
}

extension KeyedContainer: KeyedEncodingContainerProtocol {
    func insert(_ value: JSValue, for key: Key) {
        insert(.value(value), for: key)
    }

    func insert<K: CodingKey>(_ encodedValue: EncodedValue, for key: K) {
        if encodedKeyedValue == nil {
            encodedKeyedValue = [key.stringValue: encodedValue]
        } else {
            encodedKeyedValue![key.stringValue] = encodedValue
        }
    }

    func encodeNil(forKey key: Key) throws {
        insert(NSNull(), for: key)
    }

    func encode<T>(_ value: T, forKey key: Key) throws where T: Encodable {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        try value.encode(to: encoder)
        insert(.nestedContainer(encoder), for: key)
    }

    // This is a perectly valid name for this method. The underscore is to avoid a conflict with the
    // protocol requirement.
    // swiftlint:disable:next identifier_name
    func _encodeIfPresent<T>(_ value: T?, forKey key: Key) throws where T: Encodable {
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

    func encodeIfPresent<T>(_ value: T?, forKey key: Key) throws where T: Encodable {
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

    func nestedContainer<NestedKey>(keyedBy keyType: NestedKey.Type, forKey key: Key) -> KeyedEncodingContainer<NestedKey> where NestedKey: CodingKey {
        var newPath = codingPath
        newPath.append(key)

        let nestedContainer = KeyedContainer<NestedKey>(
            codingPath: newPath,
            userInfo: userInfo,
            optionalEncodingStrategy: optionalEncodingStrategy
        )

        insert(.nestedContainer(nestedContainer), for: key)
        return KeyedEncodingContainer(nestedContainer)
    }

    func nestedUnkeyedContainer(forKey key: Key) -> UnkeyedEncodingContainer {
        var newPath = codingPath
        newPath.append(key)
        let nestedContainer = UnkeyedContainer(
            codingPath: codingPath,
            userInfo: userInfo,
            optionalEncodingStrategy: optionalEncodingStrategy
        )
        insert(.nestedContainer(nestedContainer), for: key)
        return nestedContainer
    }

    enum SuperKey: String, CodingKey {
        case `super`
    }

    func superEncoder() -> Encoder {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        insert(.nestedContainer(encoder), for: SuperKey.super)
        return encoder
    }

    func superEncoder(forKey key: Key) -> Encoder {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        insert(.nestedContainer(encoder), for: key)
        return encoder
    }
}

private class AnyKeyedContainer: JSValueEncodingContainer {
    var data: JSValue? { object() }
    var object: () -> JSObject?

    init<Key>(_ keyedContainer: KeyedContainer<Key>) where Key: CodingKey {
        object = { keyedContainer.object }
    }
}

extension KeyedContainer: JSValueEncodingContainer {
    var data: JSValue? { object }
}

private final class UnkeyedContainer {
    var array: JSArray? {
        encodedUnkeyedValue?.reduce(into: []) { arr, next in
            switch next {
            case .value(let value):
                arr.append(value)
            case .nestedContainer(let container):
                guard let data = container.data else { return }
                arr.append(data)
            }
        }
    }

    var codingPath: [CodingKey]
    var userInfo: CodingUserInfo
    var optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy
    private var encodedUnkeyedValue: [EncodedValue]?

    init(codingPath: [CodingKey], userInfo: CodingUserInfo, optionalEncodingStrategy: JSValueEncoder.OptionalEncodingStrategy) {
        self.codingPath = codingPath
        self.userInfo = userInfo
        self.optionalEncodingStrategy = optionalEncodingStrategy
    }
}

extension UnkeyedContainer: UnkeyedEncodingContainer {
    private func append(_ value: any JSValue) {
        append(.value(value))
    }

    private func append(_ value: EncodedValue) {
        if encodedUnkeyedValue == nil {
            encodedUnkeyedValue = [value]
        } else {
            encodedUnkeyedValue!.append(value)
        }
    }

    var count: Int {
        array?.count ?? 0
    }

    func encodeNil() throws {
        append(NSNull())
    }

    func encode<T>(_ value: T) throws where T: Encodable {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        try value.encode(to: encoder)
        append(.nestedContainer(encoder))
    }

    func nestedUnkeyedContainer() -> UnkeyedEncodingContainer {
        let nestedContainer = UnkeyedContainer(
            codingPath: codingPath,
            userInfo: userInfo,
            optionalEncodingStrategy: optionalEncodingStrategy
        )
        append(.nestedContainer(nestedContainer))
        return nestedContainer
    }

    func nestedContainer<NestedKey>(keyedBy keyType: NestedKey.Type) -> KeyedEncodingContainer<NestedKey> where NestedKey: CodingKey {
        let nestedContainer = KeyedContainer<NestedKey>(
            codingPath: codingPath,
            userInfo: userInfo,
            optionalEncodingStrategy: optionalEncodingStrategy
        )
        append(.nestedContainer(nestedContainer))
        return KeyedEncodingContainer(nestedContainer)
    }

    func superEncoder() -> Encoder {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        append(.nestedContainer(encoder))
        return encoder
    }
}

extension UnkeyedContainer: JSValueEncodingContainer {
    var data: JSValue? { array }
}

private final class SingleValueContainer {
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

extension SingleValueContainer: SingleValueEncodingContainer {
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

    func encode<T>(_ value: T) throws where T: Encodable {
        let encoder = _JSValueEncoder(optionalEncodingStrategy: optionalEncodingStrategy)
        try value.encode(to: encoder)
        data = encoder.data
    }
}

extension SingleValueContainer: JSValueEncodingContainer {}
