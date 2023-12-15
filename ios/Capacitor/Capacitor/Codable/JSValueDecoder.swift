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
    public init() {}

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
        let decoder = _JSValueDecoder(data: data)
        return try T(from: decoder)
    }
}

typealias CodingUserInfo = [CodingUserInfoKey: Any]

private final class _JSValueDecoder {
    var codingPath: [CodingKey] = []
    var userInfo: CodingUserInfo = [:]
    fileprivate var data: JSValue

    init(data: JSValue) {
        self.data = data
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
                userInfo: userInfo
            )
        )
    }

    func unkeyedContainer() throws -> UnkeyedDecodingContainer {
        guard let data = data as? JSArray else {
            throw DecodingError.typeMismatch(JSArray.self, on: data, codingPath: codingPath)
        }

        return UnkeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo)
    }

    func singleValueContainer() throws -> SingleValueDecodingContainer {
        SingleValueContainer(data: data, codingPath: codingPath, userInfo: userInfo)
    }
}

private final class KeyedContainer<Key> where Key: CodingKey {
    var data: JSObject
    var codingPath: [CodingKey]
    var userInfo: CodingUserInfo
    var allKeys: [Key]

    init(data: JSObject, codingPath: [CodingKey], userInfo: CodingUserInfo) {
        self.data = data
        self.codingPath = codingPath
        self.userInfo = userInfo
        self.allKeys = data.keys.compactMap(Key.init(stringValue:))
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
        let decoder = _JSValueDecoder(data: rawValue)
        return try T(from: decoder)
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

        return UnkeyedContainer(data: data, codingPath: newPath, userInfo: userInfo)
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

        return KeyedDecodingContainer(KeyedContainer<NestedKey>(data: data, codingPath: newPath, userInfo: userInfo))
    }

    enum SuperKey: String, CodingKey { case `super` }

    func superDecoder() throws -> Decoder {
        var newPath = codingPath
        newPath.append(SuperKey.super)
        guard let data = data[SuperKey.super.stringValue] else {
            throw DecodingError.keyNotFound(SuperKey.super, on: data, codingPath: newPath)
        }

        return _JSValueDecoder(data: data)
    }

    func superDecoder(forKey key: Key) throws -> Decoder {
        var newPath = codingPath
        newPath.append(key)
        guard let data = data[key.stringValue] else {
            throw DecodingError.keyNotFound(key, on: data, codingPath: newPath)
        }

        return _JSValueDecoder(data: data)
    }
}

private final class UnkeyedContainer {
    var data: JSArray
    var codingPath: [CodingKey]
    var userInfo: CodingUserInfo
    private(set) var currentIndex = 0

    init(data: JSArray, codingPath: [CodingKey], userInfo: CodingUserInfo) {
        self.data = data
        self.codingPath = codingPath
        self.userInfo = userInfo
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
        let decoder = _JSValueDecoder(data: data[currentIndex])
        return try T(from: decoder)
    }

    func nestedUnkeyedContainer() throws -> UnkeyedDecodingContainer {
        defer { currentIndex += 1 }
        guard let data = data[currentIndex] as? JSArray else {
            throw DecodingError.typeMismatch(JSArray.self, on: data[currentIndex], codingPath: codingPath)
        }

        return UnkeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo)
    }

    func nestedContainer<NestedKey>(keyedBy type: NestedKey.Type) throws -> KeyedDecodingContainer<NestedKey> where NestedKey: CodingKey {
        defer { currentIndex += 1 }
        guard let data = data[currentIndex] as? JSObject else {
            throw DecodingError.typeMismatch(JSObject.self, on: data[currentIndex], codingPath: codingPath)
        }

        return KeyedDecodingContainer(KeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo))
    }

    func superDecoder() throws -> Decoder {
        defer { currentIndex += 1 }
        let data = data[currentIndex]
        return _JSValueDecoder(data: data)
    }
}

private final class SingleValueContainer {
    var data: JSValue
    var codingPath: [CodingKey]
    var userInfo: CodingUserInfo

    init(data: JSValue, codingPath: [CodingKey], userInfo: CodingUserInfo) {
        self.data = data
        self.codingPath = codingPath
        self.userInfo = userInfo
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

    func decode(_ type: Bool.Type) throws -> Bool {
        try cast(to: type)
    }

    func decode(_ type: String.Type) throws -> String {
        try cast(to: type)
    }

    func decode(_ type: Double.Type) throws -> Double {
        try cast(to: type)
    }

    func decode(_ type: Float.Type) throws -> Float {
        try cast(to: type)
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
        let decoder = _JSValueDecoder(data: data)
        return try T(from: decoder)
    }
}

extension DecodingError {
    static func typeMismatch(_ type: Any.Type, on data: JSValue, codingPath: [CodingKey]) -> DecodingError {
        return .typeMismatch(
            type,
            .init(
                codingPath: codingPath,
                debugDescription: "\(data) was unable to be cast to \(type)."
            )
        )
    }

    static func keyNotFound(_ key: any CodingKey, on data: JSValue, codingPath: [CodingKey]) -> DecodingError {
        return .keyNotFound(
            key,
            .init(
                codingPath: codingPath,
                debugDescription: "Key \(key.stringValue) not found in \(data)")
        )
    }
}
