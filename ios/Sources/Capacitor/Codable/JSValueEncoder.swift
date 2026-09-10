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

    /// The strategies available for encoding .nan, .infinity, and -.infinity
    public enum NonConformingFloatEncodingStrategy: Equatable {
        /// Throws an error when encountering an exceptional floating-point value
        case `throw`
        /// Converts to the provided strings
        case convertToString(positiveInfinity: String, negativeInfinity: String, nan: String)
        /// Encodes directly into an NSNumber
        case deferred
    }

    /// The strategy to use when encoding `Date` values
    public typealias DateEncodingStrategy = JSONEncoder.DateEncodingStrategy

    /// The strategy to use when encoding `Data` values
    public typealias DataEncodingStrategy = JSONEncoder.DataEncodingStrategy

    fileprivate struct Options {
        var optionalStrategy: OptionalEncodingStrategy
        var dateStrategy: DateEncodingStrategy
        var dataStrategy: DataEncodingStrategy
        var nonConformingFloatStrategy: NonConformingFloatEncodingStrategy
    }

    private var options: Options

    /// The strategy to use when encoding `nil` values
    public var optionalEncodingStrategy: OptionalEncodingStrategy {
        get { options.optionalStrategy }
        set { options.optionalStrategy = newValue }
    }

    /// The strategy to use when encoding dates
    public var dateEncodingStrategy: DateEncodingStrategy {
        get { options.dateStrategy }
        set { options.dateStrategy = newValue }
    }

    /// The encoding strategy to use when encoding raw data
    public var dataEncodingStrategy: DataEncodingStrategy {
        get { options.dataStrategy }
        set { options.dataStrategy = newValue }
    }

    /// The encoding strategy to use when the encoder encounters exceptional floating-point values
    public var nonConformingFloatEncodingStrategy: NonConformingFloatEncodingStrategy {
        get { options.nonConformingFloatStrategy }
        set { options.nonConformingFloatStrategy = newValue }
    }

    /// Creates a new `JSValueEncoder`
    /// - Parameter optionalEncodingStrategy: The strategy to use when encoding `nil` values. Defaults to ``OptionalEncodingStrategy-swift.enum/undefined``
    /// - Parameter dateEncodingStrategy: Defaults to `DateEncodingStrategy.deferredToDate`
    /// - Parameter dataEncodingStrategy: Defaults to `DataEncodingStrategy.deferredToData`
    /// - Parameter nonConformingFloatEncodingStategy: Defaults to ``NonConformingFloatEncodingStrategy-swift.enum/deferred``
    public init(
        optionalEncodingStrategy: OptionalEncodingStrategy = .undefined,
        dateEncodingStrategy: DateEncodingStrategy = .deferredToDate,
        dataEncodingStrategy: DataEncodingStrategy = .deferredToData,
        nonConformingFloatEncodingStategy: NonConformingFloatEncodingStrategy = .deferred
    ) {
        self.options = .init(
            optionalStrategy: optionalEncodingStrategy,
            dateStrategy: dateEncodingStrategy,
            dataStrategy: dataEncodingStrategy,
            nonConformingFloatStrategy: nonConformingFloatEncodingStategy
        )
    }

    /// Encodes an `Encodable` value to a ``JSValue``
    /// - Parameter value: The value to encode to ``JSValue``
    /// - Returns: The encoded ``JSValue``
    /// - Throws: An error if the value could not be encoded as a ``JSValue``
    public func encode<T>(_ value: T) throws -> JSValue where T: Encodable {
        let encoder = _JSValueEncoder(options: options)
        try encoder.encodeGeneric(value)
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

private typealias Options = JSValueEncoder.Options

private final class _JSValueEncoder: JSValueEncodingContainer {
    var codingPath: [CodingKey] = []
    var data: JSValue? {
        containers.data
    }

    var options: Options

    var userInfo: CodingUserInfo = [:]
    fileprivate var containers: [EncodingContainer] = []

    init(options: Options) {
        self.options = options
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
        let container = KeyedContainer<Key>(
            codingPath: codingPath,
            userInfo: userInfo,
            options: options
        )
        addContainer(.keyed(.init(container)))
        return KeyedEncodingContainer(container)
    }

    func unkeyedContainer() -> UnkeyedEncodingContainer {
        let container = UnkeyedContainer(
            codingPath: codingPath,
            userInfo: userInfo,
            options: options
        )
        addContainer(.unkeyed(container))
        return container
    }

    func singleValueContainer() -> SingleValueEncodingContainer {
        let container = SingleValueContainer(
            codingPath: codingPath,
            userInfo: userInfo,
            options: options
        )
        addContainer(.singleValue(container))
        return container
    }

    fileprivate func encodeGeneric<T>(_ value: T) throws where T: Encodable {
        switch value {
        case let value as Date:
            switch options.dateStrategy {
            case .deferredToDate:
                try value.encode(to: self)
            case .millisecondsSince1970:
                try (value.timeIntervalSince1970 * Double(MSEC_PER_SEC)).encode(to: self)
            case .secondsSince1970:
                try value.timeIntervalSince1970.encode(to: self)
            case .iso8601:
                let formattedDate = ISO8601DateFormatter().string(from: value)
                try formattedDate.encode(to: self)
            case .formatted(let formatter):
                let formattedDate = formatter.string(from: value)
                try formattedDate.encode(to: self)
            case .custom(let encode):
                try encode(value, self)
            @unknown default:
                try value.encode(to: self)
            }
        case let value as URL:
            try value.absoluteString.encode(to: self)
        case let value as Data:
            switch options.dataStrategy {
            case .deferredToData:
                try value.encode(to: self)
            case .base64:
                try value.base64EncodedString().encode(to: self)
            case .custom(let encode):
                try encode(value, self)
            @unknown default:
                try value.encode(to: self)
            }
        default:
            try value.encode(to: self)
        }
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
    var options: Options
    private var encodedKeyedValue: [String: EncodedValue]?

    init(codingPath: [CodingKey], userInfo: CodingUserInfo, options: Options) {
        self.codingPath = codingPath
        self.userInfo = userInfo
        self.options = options
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
        let encoder = _JSValueEncoder(options: options)
        try encoder.encodeGeneric(value)
        insert(.nestedContainer(encoder), for: key)
    }

    // This is a perectly valid name for this method. The underscore is to avoid a conflict with the
    // protocol requirement.
    // swiftlint:disable:next identifier_name
    func _encodeIfPresent<T>(_ value: T?, forKey key: Key) throws where T: Encodable {
        switch options.optionalStrategy {
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
            options: options
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
            options: options
        )
        insert(.nestedContainer(nestedContainer), for: key)
        return nestedContainer
    }

    enum SuperKey: String, CodingKey {
        case `super`
    }

    func superEncoder() -> Encoder {
        let encoder = _JSValueEncoder(options: options)
        insert(.nestedContainer(encoder), for: SuperKey.super)
        return encoder
    }

    func superEncoder(forKey key: Key) -> Encoder {
        let encoder = _JSValueEncoder(options: options)
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
    var options: Options
    private var encodedUnkeyedValue: [EncodedValue]?

    init(codingPath: [CodingKey], userInfo: CodingUserInfo, options: Options) {
        self.codingPath = codingPath
        self.userInfo = userInfo
        self.options = options
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
        let encoder = _JSValueEncoder(options: options)
        try encoder.encodeGeneric(value)
        append(.nestedContainer(encoder))
    }

    func nestedUnkeyedContainer() -> UnkeyedEncodingContainer {
        let nestedContainer = UnkeyedContainer(
            codingPath: codingPath,
            userInfo: userInfo,
            options: options
        )
        append(.nestedContainer(nestedContainer))
        return nestedContainer
    }

    func nestedContainer<NestedKey>(keyedBy keyType: NestedKey.Type) -> KeyedEncodingContainer<NestedKey> where NestedKey: CodingKey {
        let nestedContainer = KeyedContainer<NestedKey>(
            codingPath: codingPath,
            userInfo: userInfo,
            options: options
        )
        append(.nestedContainer(nestedContainer))
        return KeyedEncodingContainer(nestedContainer)
    }

    func superEncoder() -> Encoder {
        let encoder = _JSValueEncoder(options: options)
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
    var options: Options

    init(codingPath: [CodingKey], userInfo: CodingUserInfo, options: Options) {
        self.codingPath = codingPath
        self.userInfo = userInfo
        self.options = options
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
        try encodeFloat(value)
    }

    // swiftlint:disable force_cast
    private func encodeFloat<N>(_ value: N) throws where N: FloatingPoint {
        if value.isFinite {
            data = value as! NSNumber
        } else {
            switch options.nonConformingFloatStrategy {
            case .deferred:
                data = value as! NSNumber
            case let .convertToString(positiveInfinity: pos, negativeInfinity: neg, nan: nan):
                if value == .infinity { data = pos }
                if value == -.infinity { data = neg }
                if value.isNaN { data = nan }
            case .throw:
                throw EncodingError.invalidValue(
                    value,
                    .init(codingPath: codingPath, debugDescription: "Unable to encode \(value) to JSValue")
                )
            }
        }
    }
    // swiftlint:enable force_cast

    func encode(_ value: Float) throws {
        try encodeFloat(value)
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
        let encoder = _JSValueEncoder(options: options)
        try encoder.encodeGeneric(value)
        data = encoder.data
    }
}

extension SingleValueContainer: JSValueEncodingContainer {}
