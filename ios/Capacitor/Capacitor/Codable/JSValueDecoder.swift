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
    /// An error will be thrown from this method for three possible reasons:
    /// 1. A type mismatch was found.
    /// 2. A key was not found in the `data` field that is required in the `type` provided.
    /// 3. The `type` provided is a class.
    ///
    /// Classes are not currently supported due to the complex
    /// recursive nature involved with inheritance.
    public func decode<T>(_ type: T.Type, from data: JSValue) throws -> T where T: Decodable {
        if type is AnyObject.Type { throw ClassDecodingUnsupported() }
        let decoder = _JSValueDecoder(data: data)
        return try T(from: decoder)
    }
}

typealias CodingUserInfo = [CodingUserInfoKey: Any]

fileprivate final class _JSValueDecoder {
    internal var codingPath: [CodingKey] = []
    internal var userInfo: CodingUserInfo = [:]
    fileprivate var data: JSValue

    init(data: JSValue) {
        self.data = data
    }
}

extension _JSValueDecoder: Decoder {
    func container<Key>(keyedBy type: Key.Type) throws -> KeyedDecodingContainer<Key> where Key: CodingKey {
        guard let data = data as? JSObject else {
            throw DecodingError.typeMismatch(JSObject.self, .init(codingPath: codingPath, debugDescription: "Unable to decode \(data) as JSObject"))
        }

        return KeyedDecodingContainer(KeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo))
    }

    func unkeyedContainer() throws -> UnkeyedDecodingContainer {
        guard let data = data as? JSArray else {
            throw DecodingError.typeMismatch(JSArray.self, .init(codingPath: codingPath, debugDescription: "Unable to decode \(data) as JSArray"))
        }

        return UnkeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo)
    }

    func singleValueContainer() throws -> SingleValueDecodingContainer {
        SingleValueContainer(data: data, codingPath: codingPath, userInfo: userInfo)
    }
}

extension _JSValueDecoder {
    fileprivate final class KeyedContainer<Key> where Key: CodingKey {
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
}

extension _JSValueDecoder.KeyedContainer: KeyedDecodingContainerProtocol {
    func contains(_ key: Key) -> Bool {
        allKeys.contains { $0.stringValue == key.stringValue }
    }

    func decodeNil(forKey key: Key) throws -> Bool {
        data[key.stringValue] == nil || data[key.stringValue] is NSNull
    }

    func decode<T>(_ type: T.Type, forKey key: Key) throws -> T where T: Decodable {
        guard let rawValue = data[key.stringValue] else {
            throw DecodingError.keyNotFound(key, .init(codingPath: codingPath, debugDescription: "Data for key \(key.stringValue) was nil"))
        }

        var newPath = codingPath
        newPath.append(key)
        let decoder = _JSValueDecoder(data: rawValue)
        return try T(from: decoder)
    }

    func nestedUnkeyedContainer(forKey key: Key) throws -> UnkeyedDecodingContainer {
        fatalError()
    }

    func nestedContainer<NestedKey>(keyedBy type: NestedKey.Type, forKey key: Key) throws -> KeyedDecodingContainer<NestedKey> where NestedKey: CodingKey {
        var newPath = codingPath
        newPath.append(key)
        guard let data = data[key.stringValue] as? JSObject else {
            throw DecodingError.typeMismatch(
                JSObject.self,
                .init(codingPath: codingPath, debugDescription: "Unable to decode \(String(describing: data[key.stringValue])) as JSObject")
            )
        }

        return KeyedDecodingContainer(_JSValueDecoder.KeyedContainer(data: data, codingPath: newPath, userInfo: userInfo))
    }

    func superDecoder() throws -> Decoder {
        fatalError("Classes are not supported by JSValueDecoder.")
    }

    func superDecoder(forKey key: Key) throws -> Decoder {
        fatalError("Classes are not supported by JSValueDecoder.")
    }
}

extension _JSValueDecoder {
    fileprivate final class UnkeyedContainer {
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
}

extension _JSValueDecoder.UnkeyedContainer: UnkeyedDecodingContainer {
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
            throw DecodingError.typeMismatch(
                JSArray.self,
                .init(codingPath: codingPath, debugDescription: "Unable to decode \(String(describing: data[currentIndex])) as JSArray")
            )
        }

        return _JSValueDecoder.UnkeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo)
    }

    func nestedContainer<NestedKey>(keyedBy type: NestedKey.Type) throws -> KeyedDecodingContainer<NestedKey> where NestedKey: CodingKey {
        defer { currentIndex += 1 }
        guard let data = data[currentIndex] as? JSObject else {
            throw DecodingError.typeMismatch(
                JSObject.self,
                .init(codingPath: codingPath, debugDescription: "Unable to decode \(String(describing: data[currentIndex])) as JSObject")
            )
        }

        return KeyedDecodingContainer(_JSValueDecoder.KeyedContainer(data: data, codingPath: codingPath, userInfo: userInfo))
    }

    func superDecoder() throws -> Decoder {
        fatalError("Classes are not supported by JSValueDecoder.")
    }
}

extension _JSValueDecoder {
    final class SingleValueContainer {
        var data: JSValue
        var codingPath: [CodingKey]
        var userInfo: CodingUserInfo

        init(data: JSValue, codingPath: [CodingKey], userInfo: CodingUserInfo) {
            self.data = data
            self.codingPath = codingPath
            self.userInfo = userInfo
        }
    }
}

extension _JSValueDecoder.SingleValueContainer: SingleValueDecodingContainer {
    func decodeNil() -> Bool {
        return data is NSNull
    }

    private func cast<T>(to type: T.Type) throws -> T {
        guard let data = data as? T else {
            throw DecodingError.typeMismatch(type, .init(codingPath: codingPath, debugDescription: "\(data) was unable to be cast to \(type)"))
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
