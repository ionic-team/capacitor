//
//  JSValueDecoder.swift
//  Capacitor
//
//  Created by Steven Sherry on 12/8/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

import Foundation
import Combine

/// A decoder that can decode ``JSValue`` objects into `Decodable` types.
public final class JSValueDecoder: TopLevelDecoder {
    /// The strategies available for formatting dates when decoding from a ``JSValue``
    public typealias DateDecodingStrategy = JSONDecoder.DateDecodingStrategy
    /// The strategies available for decoding raw data.
    public typealias DataDecodingStrategy = JSONDecoder.DataDecodingStrategy

    /// The strategies availble for decoding NaN, Infinity, and -Infinity
    public enum NonConformingFloatDecodingStrategy {
        /// Decodes directly into the floating point type as .infinity, -.infinity, or .nan
        case deferred
        /// Throw an error when a non-conforming float is encountered
        case `throw`
        /// Converts from the provided strings into .infinity, -.infinity, or .nan
        case convertFromString(positiveInfinity: String, negativeInfinity: String, nan: String)
    }

    fileprivate struct Options {
        var dataStrategy: DataDecodingStrategy
        var dateStrategy: DateDecodingStrategy
        var nonConformingStrategy: NonConformingFloatDecodingStrategy
    }

    private var options: Options

    /// Creates a new JSValueDecoder with the provided decoding and formatting strategies
    /// - Parameters:
    ///   - dateDecodingStrategy: Defaults to `DateDecodingStrategy.deferredToDate`
    ///   - dataDecodingStrategy: Defaults to `DataDecodingStrategy.deferredToData`
    ///   - nonConformingFloatDecodingStrategy: Defaults to ``NonConformingFloatDecodingStrategy/deferred``
    public init(
        dateDecodingStrategy: DateDecodingStrategy = .deferredToDate,
        dataDecodingStrategy: DataDecodingStrategy = .deferredToData,
        nonConformingFloatDecodingStrategy: NonConformingFloatDecodingStrategy = .deferred
    ) {
        self.options = .init(dataStrategy: dataDecodingStrategy, dateStrategy: dateDecodingStrategy, nonConformingStrategy: nonConformingFloatDecodingStrategy)
    }

    fileprivate init(options: Options) {
        self.options = options
    }

    /// The strategy to use when decoding dates from a ``JSValue``
    public var dateDecodingStrategy: DateDecodingStrategy {
        get { options.dateStrategy }
        set { options.dateStrategy = newValue }
    }

    /// The strategy to use when decoding raw data from a ``JSValue``
    public var dataDecodingStrategy: DataDecodingStrategy {
        get { options.dataStrategy }
        set { options.dataStrategy = newValue }
    }

    /// The strategy used by a decoder when it encounters exceptional floating-point values
    public var nonConformingFloatDecodingStrategy: NonConformingFloatDecodingStrategy {
        get { options.nonConformingStrategy }
        set { options.nonConformingStrategy = newValue }
    }

    /// Decodes a ``JSValue`` into the provided `Decodable` type
    /// - Parameters:
    ///   - type: The type of the value to decode from the provided ``JSValue`` object
    ///   - data: The ``JSValue`` to decode
    /// - Returns: A value of the specified type.
    ///
    /// An error will be thrown from this method for two possible reasons:
    /// 1. A type mismatch was found.
    /// 2. A key was not found in the `data` field that is required in the `type` provided.
    public func decode<T>(_ type: T.Type, from data: JSValue) throws -> T where T: Decodable {
        let decoder = _JSValueDecoder(data: data, options: options)
        return try decoder.decodeData(as: T.self)
    }
}

typealias CodingUserInfo = [CodingUserInfoKey: Any]
private typealias Options = JSValueDecoder.Options

private final class _JSValueDecoder {
    var codingPath: [CodingKey] = []
    var userInfo: CodingUserInfo = [:]
    var options: Options
    fileprivate var data: JSValue

    init(data: JSValue, options: Options) {
        self.data = data
        self.options = options
    }
}

extension _JSValueDecoder: Decoder {
    func container<Key>(keyedBy type: Key.Type) throws -> KeyedDecodingContainer<Key> where Key: CodingKey {
        guard let data = data as? JSObject else {
            throw DecodingError.typeMismatch(JSObject.self, on: data, codingPath: codingPath)
        }

        return KeyedDecodingContainer(
            KeyedContainer(
                data: data,
                codingPath: codingPath,
                userInfo: userInfo,
                options: options
            )
        )
    }

    func unkeyedContainer() throws -> UnkeyedDecodingContainer {
        guard let data = data as? JSArray else {
            throw DecodingError.typeMismatch(JSArray.self, on: data, codingPath: codingPath)
        }

        return UnkeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo, options: options)
    }

    func singleValueContainer() throws -> SingleValueDecodingContainer {
        SingleValueContainer(data: data, codingPath: codingPath, userInfo: userInfo, options: options)
    }

    fileprivate func decodeData<T>(as type: T.Type) throws -> T where T: Decodable {
        switch type {
        case is Date.Type:
            switch options.dateStrategy {
            case .deferredToDate:
                return try T(from: self)
            case .secondsSince1970:
                guard let value = data as? NSNumber else { throw DecodingError.dataCorrupted(data, target: Double.self, codingPath: codingPath) }
                return Date(timeIntervalSince1970: value.doubleValue) as! T
            case .millisecondsSince1970:
                guard let value = data as? NSNumber else { throw DecodingError.dataCorrupted(data, target: Double.self, codingPath: codingPath) }
                return Date(timeIntervalSince1970: value.doubleValue / Double(MSEC_PER_SEC)) as! T
            case .iso8601:
                guard let value = data as? String else { throw DecodingError.dataCorrupted(data, target: String.self, codingPath: codingPath) }
                let formatter = ISO8601DateFormatter()
                guard let date = formatter.date(from: value) else { throw DecodingError.dataCorrupted(value, target: Date.self, codingPath: codingPath) }
                return date as! T
            case .formatted(let formatter):
                guard let value = data as? String else { throw DecodingError.dataCorrupted(data, target: String.self, codingPath: codingPath) }
                  guard let date = formatter.date(from: value) else { throw DecodingError.dataCorrupted(value, target: Date.self, codingPath: codingPath) }
                  return date as! T
            case .custom(let decode):
                return try decode(self) as! T
            @unknown default:
                return try T(from: self)
            }
        case is URL.Type:
            guard let str = data as? String,
                let url = URL(string: str)
            else { throw DecodingError.dataCorrupted(data, target: URL.self, codingPath: codingPath) }

            return url as! T
        case is Data.Type:
            switch options.dataStrategy {
            case .deferredToData:
                return try T(from: self)
            case .base64:
                guard let value = data as? String else { throw DecodingError.dataCorrupted(data, target: String.self, codingPath: codingPath) }
                guard let data = Data(base64Encoded: value) else { throw DecodingError.dataCorrupted(value, target: Data.self, codingPath: codingPath) }
                return data as! T
            case .custom(let decode):
                return try decode(self) as! T
            @unknown default:
                return try T(from: self)
            }
        default:
            return try T(from: self)
        }
    }
}

private final class KeyedContainer<Key> where Key: CodingKey {
    var data: JSObject
    var codingPath: [CodingKey]
    var userInfo: CodingUserInfo
    var allKeys: [Key]
    var options: Options

    init(data: JSObject, codingPath: [CodingKey], userInfo: CodingUserInfo, options: Options) {
        self.data = data
        self.codingPath = codingPath
        self.userInfo = userInfo
        self.allKeys = data.keys.compactMap(Key.init(stringValue:))
        self.options = options
    }
}

extension KeyedContainer: KeyedDecodingContainerProtocol {
    func contains(_ key: Key) -> Bool {
        allKeys.contains { $0.stringValue == key.stringValue }
    }

    func decodeNil(forKey key: Key) throws -> Bool {
        data[key.stringValue] == nil || data[key.stringValue] is NSNull
    }

    func decode<T>(_ type: T.Type, forKey key: Key) throws -> T where T: Decodable {
        guard let rawValue = data[key.stringValue] else {
            throw DecodingError.keyNotFound(key, on: data, codingPath: codingPath)
        }

        var newPath = codingPath
        newPath.append(key)
        let decoder = _JSValueDecoder(data: rawValue, options: options)
        return try decoder.decodeData(as: T.self)
    }

    func nestedUnkeyedContainer(forKey key: Key) throws -> UnkeyedDecodingContainer {
        var newPath = codingPath
        newPath.append(key)
        guard let data = data[key.stringValue] as? JSArray else {
            throw DecodingError.typeMismatch(
                JSArray.self,
                on: data[key.stringValue] ?? "null value",
                codingPath: newPath
            )
        }

        return UnkeyedContainer(data: data, codingPath: newPath, userInfo: userInfo, options: options)
    }

    func nestedContainer<NestedKey>(keyedBy type: NestedKey.Type, forKey key: Key) throws -> KeyedDecodingContainer<NestedKey> where NestedKey: CodingKey {
        var newPath = codingPath
        newPath.append(key)
        guard let data = data[key.stringValue] as? JSObject else {
            throw DecodingError.typeMismatch(
                JSObject.self,
                on: data[key.stringValue] ?? "null value",
                codingPath: newPath
            )
        }

        return KeyedDecodingContainer(KeyedContainer<NestedKey>(data: data, codingPath: newPath, userInfo: userInfo, options: options))
    }

    enum SuperKey: String, CodingKey { case `super` }

    func superDecoder() throws -> Decoder {
        var newPath = codingPath
        newPath.append(SuperKey.super)
        guard let data = data[SuperKey.super.stringValue] else {
            throw DecodingError.keyNotFound(SuperKey.super, on: data, codingPath: newPath)
        }

        return _JSValueDecoder(data: data, options: options)
    }

    func superDecoder(forKey key: Key) throws -> Decoder {
        var newPath = codingPath
        newPath.append(key)
        guard let data = data[key.stringValue] else {
            throw DecodingError.keyNotFound(key, on: data, codingPath: newPath)
        }

        return _JSValueDecoder(data: data, options: options)
    }
}

private final class UnkeyedContainer {
    var data: JSArray
    var codingPath: [CodingKey]
    var userInfo: CodingUserInfo
    private(set) var currentIndex = 0
    var options: Options

    init(data: JSArray, codingPath: [CodingKey], userInfo: CodingUserInfo, options: Options) {
        self.data = data
        self.codingPath = codingPath
        self.userInfo = userInfo
        self.options = options
    }
}

extension UnkeyedContainer: UnkeyedDecodingContainer {
    var count: Int? {
        data.count
    }

    var isAtEnd: Bool {
        currentIndex == data.endIndex
    }

    func decodeNil() throws -> Bool {
        defer { currentIndex += 1 }
        return data[currentIndex] is NSNull
    }

    func decode<T>(_ type: T.Type) throws -> T where T: Decodable {
        defer { currentIndex += 1 }
        let decoder = _JSValueDecoder(data: data[currentIndex], options: options)
        return try decoder.decodeData(as: T.self)
    }

    func nestedUnkeyedContainer() throws -> UnkeyedDecodingContainer {
        defer { currentIndex += 1 }
        guard let data = data[currentIndex] as? JSArray else {
            throw DecodingError.typeMismatch(JSArray.self, on: data[currentIndex], codingPath: codingPath)
        }

        return UnkeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo, options: options)
    }

    func nestedContainer<NestedKey>(keyedBy type: NestedKey.Type) throws -> KeyedDecodingContainer<NestedKey> where NestedKey: CodingKey {
        defer { currentIndex += 1 }
        guard let data = data[currentIndex] as? JSObject else {
            throw DecodingError.typeMismatch(JSObject.self, on: data[currentIndex], codingPath: codingPath)
        }

        return KeyedDecodingContainer(KeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo, options: options))
    }

    func superDecoder() throws -> Decoder {
        defer { currentIndex += 1 }
        let data = data[currentIndex]
        return _JSValueDecoder(data: data, options: options)
    }
}

private final class SingleValueContainer {
    var data: JSValue
    var codingPath: [CodingKey]
    var userInfo: CodingUserInfo
    var options: Options

    init(data: JSValue, codingPath: [CodingKey], userInfo: CodingUserInfo, options: Options) {
        self.data = data
        self.codingPath = codingPath
        self.userInfo = userInfo
        self.options = options
    }
}

extension SingleValueContainer: SingleValueDecodingContainer {
    func decodeNil() -> Bool {
        return data is NSNull
    }

    private func cast<T>(to type: T.Type) throws -> T {
        guard let data = data as? T else {
            throw DecodingError.typeMismatch(type, on: data, codingPath: codingPath)
        }

        return data
    }

    private func castFloat<N>(to type: N.Type) throws -> N where N: FloatingPoint {
        if let data = data as? String,
            case let .convertFromString(positiveInfinity: pos, negativeInfinity: neg, nan: nan) = options.nonConformingStrategy {
            switch data {
            case pos:
                return N.infinity
            case neg:
                return -N.infinity
            case nan:
                return N.nan
            default:
                throw DecodingError.typeMismatch(type, on: data, codingPath: codingPath)
            }
        }

        let data = try cast(to: N.self)
        if !data.isFinite, case .throw = options.nonConformingStrategy {
            throw DecodingError.dataCorrupted(.init(codingPath: codingPath, debugDescription: "\(data) is a non-conforming floating point number"))
        }
        return data
    }

    func decode(_ type: Bool.Type) throws -> Bool {
        try cast(to: type)
    }

    func decode(_ type: String.Type) throws -> String {
        try cast(to: type)
    }

    func decode(_ type: Double.Type) throws -> Double {
        try castFloat(to: type)
    }

    func decode(_ type: Float.Type) throws -> Float {
        try castFloat(to: type)
    }

    func decode(_ type: Int.Type) throws -> Int {
        try cast(to: type)
    }

    func decode(_ type: Int8.Type) throws -> Int8 {
        try cast(to: type)
    }

    func decode(_ type: Int16.Type) throws -> Int16 {
        try cast(to: type)
    }

    func decode(_ type: Int32.Type) throws -> Int32 {
        try cast(to: type)
    }

    func decode(_ type: Int64.Type) throws -> Int64 {
        try cast(to: type)
    }

    func decode(_ type: UInt.Type) throws -> UInt {
        try cast(to: type)
    }

    func decode(_ type: UInt8.Type) throws -> UInt8 {
        try cast(to: type)
    }

    func decode(_ type: UInt16.Type) throws -> UInt16 {
        try cast(to: type)
    }

    func decode(_ type: UInt32.Type) throws -> UInt32 {
        try cast(to: type)
    }

    func decode(_ type: UInt64.Type) throws -> UInt64 {
        try cast(to: type)
    }

    func decode<T>(_ type: T.Type) throws -> T where T: Decodable {
        let decoder = _JSValueDecoder(data: data, options: options)
        return try decoder.decodeData(as: T.self)
    }
}

extension DecodingError {
    static func typeMismatch(_ type: Any.Type, on data: any JSValue, codingPath: [CodingKey]) -> DecodingError {
        return .typeMismatch(
            type,
            .init(
                codingPath: codingPath,
                debugDescription: "\(data) was unable to be cast to \(type)."
            )
        )
    }

    static func keyNotFound(_ key: any CodingKey, on data: any JSValue, codingPath: [CodingKey]) -> DecodingError {
        return .keyNotFound(
            key,
            .init(
                codingPath: codingPath,
                debugDescription: "Key \(key.stringValue) not found in \(data)")
        )
    }

    static func dataCorrupted<T>(_ value: any JSValue, target type: T.Type, codingPath: [CodingKey]) -> DecodingError where T: Decodable {
        return .dataCorrupted(.init(codingPath: codingPath, debugDescription: "\(value) was not in the format expected for \(T.self)"))
    }
}
