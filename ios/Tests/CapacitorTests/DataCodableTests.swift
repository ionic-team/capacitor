//
//  DataCodableTests.swift
//  CodableTests
//
//  Created by Steven Sherry on 9/6/24.
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import XCTest
import Capacitor

private struct Foo: Codable, Equatable {
    var data: Data
}

private let jsonString = #"{ "key": "value" }"#
private let jsonData = jsonString.data(using: .utf8)!
private let jsonByteArray: [NSNumber] = [123, 32, 34, 107, 101, 121, 34, 58, 32, 34, 118, 97, 108, 117, 101, 34, 32, 125]
private let jsonBase64 = "eyAia2V5IjogInZhbHVlIiB9"

class JSValueDecoderDataTests: XCTestCase {
    func testDecode_data__default_root() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Data.self, from: jsonByteArray)
        XCTAssertEqual(result, jsonData)
    }

    func testDecode_data__default_array() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode([Data].self, from: [jsonByteArray, jsonByteArray])
        XCTAssertEqual(result, [jsonData, jsonData])
    }

    func testDecode_data__default_struct() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Foo.self, from: ["data": jsonByteArray])
        XCTAssertEqual(result, .init(data: jsonData))
    }

    func testDecode_data__base64_root() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: .base64)
        let result = try decoder.decode(Data.self, from: jsonBase64)
        XCTAssertEqual(result, jsonData)
    }

    func testDecode_data__base64_array() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: .base64)
        let result = try decoder.decode([Data].self, from: [jsonBase64, jsonBase64])
        XCTAssertEqual(result, [jsonData, jsonData])
    }

    func testDecode_data__base64_struct() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: .base64)
        let result = try decoder.decode(Foo.self, from: ["data": jsonBase64])
        XCTAssertEqual(result, .init(data: jsonData))
    }

    let customStrategy = JSValueDecoder.DataDecodingStrategy.custom { decoder in
        var container = try decoder.unkeyedContainer()
        var byteArray: [UInt8] = []
        while !container.isAtEnd {
            byteArray.append(try container.decode(UInt8.self))
        }
        return Data(byteArray)
    }

    func testDecode_data__custom_root() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: customStrategy)
        let result = try decoder.decode(Data.self, from: jsonByteArray)
        XCTAssertEqual(result, jsonData)
    }

    func testDecode_data__custom_array() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: customStrategy)
        let result = try decoder.decode([Data].self, from: [jsonByteArray, jsonByteArray])
        XCTAssertEqual(result, [jsonData, jsonData])
    }

    func testDecode_data__custom_struct() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: customStrategy)
        let result = try decoder.decode(Foo.self, from: ["data": jsonByteArray])
        XCTAssertEqual(result, .init(data: jsonData))
    }
}

class JSValueEncoderDataTests: XCTestCase {
    func testEncode_data__default_root() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(jsonData)
        let result = try XCTUnwrap(rawResult as? [NSNumber])
        XCTAssertEqual(result, jsonByteArray)
    }

    func testEncode_data__default_array() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode([jsonData, jsonData])
        let result = try XCTUnwrap(rawResult as? [[NSNumber]])
        XCTAssertEqual(result, [jsonByteArray, jsonByteArray])
    }

    func testEncode_data__default_struct() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(Foo(data: jsonData))
        let result = try XCTUnwrap(rawResult as? [String: [NSNumber]])
        XCTAssertEqual(result, ["data": jsonByteArray])
    }

    func testEncode_data__base64_root() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: .base64)
        let rawResult = try encoder.encode(jsonData)
        let result = try XCTUnwrap(rawResult as? String)
        XCTAssertEqual(result, jsonBase64)
    }

    func testEncode_data__base64_array() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: .base64)
        let rawResult = try encoder.encode([jsonData, jsonData])
        let result = try XCTUnwrap(rawResult as? [String])
        XCTAssertEqual(result, [jsonBase64, jsonBase64])
    }

    func testEncode_data__base64_struct() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: .base64)
        let rawResult = try encoder.encode(Foo(data: jsonData))
        let result = try XCTUnwrap(rawResult as? [String: String])
        XCTAssertEqual(result, ["data": jsonBase64])
    }

    let customStrategy = JSValueEncoder.DataEncodingStrategy.custom { data, encoder in
        let byteArray = data.map { $0 }
        var unkeyedContainer = encoder.unkeyedContainer()
        try unkeyedContainer.encode(contentsOf: byteArray)
    }

    func testEncode_data__custom_root() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: customStrategy)
        let rawResult = try encoder.encode(jsonData)
        let result = try XCTUnwrap(rawResult as? [NSNumber])
        XCTAssertEqual(result, jsonByteArray)
    }

    func testEncode_data__custom_array() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: customStrategy)
        let rawResult = try encoder.encode([jsonData, jsonData])
        let result = try XCTUnwrap(rawResult as? [[NSNumber]])
        XCTAssertEqual(result, [jsonByteArray, jsonByteArray])
    }

    func testEncode_data__custom_struct() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: customStrategy)
        let rawResult = try encoder.encode(Foo(data: jsonData))
        let result = try XCTUnwrap(rawResult as? [String: [NSNumber]])
        XCTAssertEqual(result, ["data": jsonByteArray])
    }
}
