//
//  SuperCodableTests.swift
//  CodableTests
//
//  Created by Steven Sherry on 12/10/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

import XCTest
import Capacitor

final class SuperCodableTests: XCTestCase {
    // MARK: Keyed Super Encoding/Decoding
    func testEncode__when_given_a_value_that_encodes_to_a_keyed_superEncoder_without_specifying_a_key__it_encodes_the_super_container_with_the_string_key_super() throws {
        let sut = JSValueEncoder()
        let value = KeyedSubSuper(bool: true)
        let encoded = try sut.encodeJSObject(value)

        let bool = try XCTUnwrap(encoded["bool"] as? Bool)
        XCTAssertTrue(bool)
        let superObject = try XCTUnwrap(encoded["super"] as? JSObject)
        let number = try XCTUnwrap(superObject["number"] as? NSNumber)
        XCTAssertEqual(0, number)
        let string = try XCTUnwrap(superObject["string"] as? String)
        XCTAssertEqual("empty", string)
    }
    func testEncode__when_given_a_value_that_encodes_to_a_keyed_superEncoder_with_a_specific_key__it_encodes_the_super_container_with_the_provided_key() throws {
        let sut = JSValueEncoder()
        let value = KeyedSubSuperKeyed(bool: false)
        value.number = 5
        value.string = "encoding"
        let encoded = try sut.encodeJSObject(value)

        let bool = try XCTUnwrap(encoded["bool"] as? Bool)
        XCTAssertFalse(bool)
        let superObject = try XCTUnwrap(encoded["info"] as? JSObject)
        let number = try XCTUnwrap(superObject["number"] as? NSNumber)
        XCTAssertEqual(5, number)
        let string = try XCTUnwrap(superObject["string"] as? String)
        XCTAssertEqual("encoding", string)
    }

    func testEncode__when_given_a_value_that_encodes_its_superclass_without_a_superEncoder__it_encodes_the_entire_structure_flattened() throws {
        let sut = JSValueEncoder()
        let value = KeyedSubSuperFlat(bool: true)
        value.number = 10
        value.string = "flattened"
        let encoded = try sut.encodeJSObject(value)

        let bool = try XCTUnwrap(encoded["bool"] as? Bool)
        XCTAssertTrue(bool)
        let number = try XCTUnwrap(encoded["number"] as? NSNumber)
        XCTAssertEqual(10, number)
        let string = try XCTUnwrap(encoded["string"] as? String)
        XCTAssertEqual("flattened", string)
    }

    func testDecode__when_given_a_value_that_decodes_its_superclass_without_specifying_a_key__it_will_attempt_to_decode_the_super_container_from_the_super_key() throws {
        let sut = JSValueDecoder()
        let value: JSObject = [
            "super": [
                "number": 5,
                "string": "super decoding"
            ],
            "bool": true
        ]

        let decoded = try sut.decode(KeyedSubSuper.self, from: value)
        XCTAssertTrue(decoded.bool)
        XCTAssertEqual(decoded.number, 5)
        XCTAssertEqual(decoded.string, "super decoding")
    }

    func testDecode__when_given_a_value_that_decodes_its_superclass_with_a_specific_key__it_will_attempt_to_decode_the_super_container_from_the_specified_key() throws {
        let sut = JSValueDecoder()
        let value: JSObject = [
            "info": [
                "number": 9,
                "string": "info decoding"
            ],
            "bool": false
        ]

        let decoded = try sut.decode(KeyedSubSuperKeyed.self, from: value)
        XCTAssertFalse(decoded.bool)
        XCTAssertEqual(decoded.number, 9)
        XCTAssertEqual(decoded.string, "info decoding")
    }

    func testDecode__when_given_a_value_that_decodes_its_superclass_without_a_superContainer__it_will_attempt_to_decode_a_flat_structure() throws {
        let sut = JSValueDecoder()
        let value: JSObject = [
            "number": 20,
            "string": "flat decoding",
            "bool": true
        ]

        let decoded = try sut.decode(KeyedSubSuperFlat.self, from: value)
        XCTAssertTrue(decoded.bool)
        XCTAssertEqual(decoded.number, 20)
        XCTAssertEqual(decoded.string, "flat decoding")
    }

    // MARK: Unkeyed Super Encoding/Decoding
    func testEncode__when_given_a_value_that_encodes_its_superclass_with_a_superContainer__it_will_encode_the_super_container_as_a_nested_array() throws {
        let sut = JSValueEncoder()
        let value = UnkeyedSubSuper(bool: true)
        value.number = -3
        value.string = "unkeyed encoding"

        let encoded = try XCTUnwrap(try sut.encode(value) as? JSArray)
        XCTAssertEqual(encoded[0] as? Bool, true)
        let nested = try XCTUnwrap(encoded[1] as? JSArray)
        XCTAssertEqual(nested[0] as? NSNumber, -3)
        XCTAssertEqual(nested[1] as? String, "unkeyed encoding")
    }

    func testDecode__when_given_a_type_that_decodes_its_superclass_with_a_superContainer__it_will_decode_the_superclass_as_a_nested_array() throws {
        let sut = JSValueDecoder()
        let value: JSArray = [
            true, [4, "unkeyed decoding"]
        ]

        let decoded = try sut.decode(UnkeyedSubSuper.self, from: value)
        XCTAssertTrue(decoded.bool)
        XCTAssertEqual(decoded.number, 4)
        XCTAssertEqual(decoded.string, "unkeyed decoding")
    }
}

private class KeyedBase: Codable {
    var number: Int
    var string: String

    init(number: Int, string: String) {
        self.number = number
        self.string = string
    }
}

private class KeyedSubSuper: KeyedBase {
    var bool: Bool

    init(bool: Bool) {
        self.bool = bool
        super.init(number: 0, string: "empty")
    }

    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        bool = try container.decode(Bool.self, forKey: .bool)
        try super.init(from: container.superDecoder())
    }

    enum CodingKeys: String, CodingKey {
        case bool
    }

    override func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(bool, forKey: .bool)
        try super.encode(to: container.superEncoder())
    }
}

private class KeyedSubSuperKeyed: KeyedBase {
    var bool: Bool

    init(bool: Bool) {
        self.bool = bool
        super.init(number: 0, string: "empty")
    }

    enum CodingKeys: String, CodingKey {
        case bool, info
    }

    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        bool = try container.decode(Bool.self, forKey: .bool)
        try super.init(from: container.superDecoder(forKey: .info))
    }

    override func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(bool, forKey: .bool)
        try super.encode(to: container.superEncoder(forKey: .info))
    }
}

private class KeyedSubSuperFlat: KeyedBase {
    var bool: Bool

    init(bool: Bool) {
        self.bool = bool
        super.init(number: 0, string: "empty")
    }

    enum CodingKeys: String, CodingKey {
        case bool
    }

    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        bool = try container.decode(Bool.self, forKey: .bool)
        try super.init(from: decoder)
    }

    override func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(bool, forKey: .bool)
        try super.encode(to: encoder)
    }
}

private class UnkeyedBase: Codable {
    var number: Int
    var string: String

    init(number: Int, string: String) {
        self.number = number
        self.string = string
    }

    required init(from decoder: Decoder) throws {
        var container = try decoder.unkeyedContainer()
        self.number = try container.decode(Int.self)
        self.string = try container.decode(String.self)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.unkeyedContainer()
        try container.encode(self.number)
        try container.encode(self.string)
    }
}

private class UnkeyedSubSuper: UnkeyedBase {
    var bool: Bool

    init(bool: Bool) {
        self.bool = bool
        super.init(number: 0, string: "empty")
    }

    required init(from decoder: Decoder) throws {
        var container = try decoder.unkeyedContainer()
        bool = try container.decode(Bool.self)
        try super.init(from: container.superDecoder())
    }

    override func encode(to encoder: Encoder) throws {
        var container = encoder.unkeyedContainer()
        try container.encode(bool)
        try super.encode(to: container.superEncoder())
    }
}
