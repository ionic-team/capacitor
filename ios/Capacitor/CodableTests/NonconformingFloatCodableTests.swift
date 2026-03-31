//
//  NonconformingFloatCodableTests.swift
//  CodableTests
//
//  Created by Steven Sherry on 9/6/24.
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import XCTest
import Capacitor

private struct Foo: Codable, Equatable {
    var number: Double
}

class JSValueEncoderNonConformingFloatTests: XCTestCase {
    func testEncode_float__default_root() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(Double.infinity)
        let result = try XCTUnwrap(rawResult as? Double)
        XCTAssertEqual(result, .infinity)
    }

    func testEncode_float__default_array() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode([Double.infinity, -.infinity, .nan])
        let result = try XCTUnwrap(rawResult as? [Double])
        XCTAssertEqual(result[0...1], [.infinity, -.infinity])
        XCTAssertTrue(result[2].isNaN)
    }

    func testEncode_float__default_struct() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(Foo.init(number: .infinity))
        let result = try XCTUnwrap(rawResult as? [String: Double])
        XCTAssertEqual(result, ["number": .infinity])
    }

    func testEncode_float__convertToString_root() throws {
        let encoder = JSValueEncoder(
            nonConformingFloatEncodingStrategy: .convertToString(
                positiveInfinity: "pos",
                negativeInfinity: "neg",
                nan: "nan"
            )
        )

        var rawResult = try encoder.encode(Double.infinity)
        var result = try XCTUnwrap(rawResult as? String)
        XCTAssertEqual(result, "pos")

        rawResult = try encoder.encode(-Double.infinity)
        result = try XCTUnwrap(rawResult as? String)
        XCTAssertEqual(result, "neg")

        rawResult = try encoder.encode(Double.nan)
        result = try XCTUnwrap(rawResult as? String)
        XCTAssertEqual(result, "nan")
    }

    func testEncode_float__convertToString_array() throws {
        let encoder = JSValueEncoder(
            nonConformingFloatEncodingStrategy: .convertToString(
                positiveInfinity: "pos",
                negativeInfinity: "neg",
                nan: "nan"
            )
        )

        let rawResult = try encoder.encode([Double.infinity, -.infinity, .nan])
        let result = try XCTUnwrap(rawResult as? [String])
        XCTAssertEqual(result, ["pos", "neg", "nan"])
    }

    func testEncode_float__convertToString_struct() throws {
        let encoder = JSValueEncoder(
            nonConformingFloatEncodingStrategy: .convertToString(
                positiveInfinity: "pos",
                negativeInfinity: "neg",
                nan: "nan"
            )
        )

        var rawResult = try encoder.encode(Foo(number: .infinity))
        var result = try XCTUnwrap(rawResult as? [String: String])
        XCTAssertEqual(result, ["number": "pos"])

        rawResult = try encoder.encode(Foo(number: -.infinity))
        result = try XCTUnwrap(rawResult as? [String: String])
        XCTAssertEqual(result, ["number": "neg"])

        rawResult = try encoder.encode(Foo(number: .nan))
        result = try XCTUnwrap(rawResult as? [String: String])
        XCTAssertEqual(result, ["number": "nan"])
    }

    func testEncode_float__throw_root() throws {
        let encoder = JSValueEncoder(nonConformingFloatEncodingStrategy: .throw)
        XCTAssertThrowsError(try encoder.encode(Double.infinity))
    }

    func testEncode_float__throw_array() throws {
        let encoder = JSValueEncoder(nonConformingFloatEncodingStrategy: .throw)
        XCTAssertThrowsError(try encoder.encode([Double.infinity, -.infinity, .nan]))
    }

    func testEncode_float__throw_struct() throws {
        let encoder = JSValueEncoder(nonConformingFloatEncodingStrategy: .throw)
        XCTAssertThrowsError(try encoder.encode(Foo(number: .infinity)))
    }
}

class JSValueDecoderNonConformingFloatTests: XCTestCase {
    func testDecode_float__default_root() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Double.self, from: Double.infinity)
        XCTAssertEqual(result, .infinity)
    }

    func testDecode_float__default_array() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode([Double].self, from: [Double.infinity, Double.infinity])
        XCTAssertEqual(result, [.infinity, .infinity])
    }

    func testDecode_float__default_struct() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Foo.self, from: ["number": Double.infinity])
        XCTAssertEqual(result, .init(number: .infinity))
    }

    func testDecode_float__throw_root() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .throw)
        XCTAssertThrowsError(try decoder.decode(Double.self, from: Double.infinity))
    }

    func testDecode_float__throw_array() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .throw)
        XCTAssertThrowsError(try decoder.decode([Double].self, from: [Double.infinity, Double.infinity]))
    }

    func testDecode_float__throw_struct() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .throw)
        XCTAssertThrowsError(try decoder.decode(Foo.self, from: ["number": Double.infinity]))
    }

    func testDecode_float__convertFromString_root() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .convertFromString(positiveInfinity: "pos", negativeInfinity: "neg", nan: "nan"))
        var result = try decoder.decode(Double.self, from: "pos")
        XCTAssertEqual(result, .infinity)
        result = try decoder.decode(Double.self, from: "neg")
        XCTAssertEqual(result, -.infinity)
        result = try decoder.decode(Double.self, from: "nan")
        XCTAssertTrue(result.isNaN)
    }

    func testDecode_float__convertFromString_array() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .convertFromString(positiveInfinity: "pos", negativeInfinity: "neg", nan: "nan"))
        let result = try decoder.decode([Double].self, from: ["pos", "neg", "nan"])
        XCTAssertEqual(result[0...1], [.infinity, -.infinity])
        XCTAssertTrue(result[2].isNaN)
    }

    func testDecode_float__convertFromString_struct() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .convertFromString(positiveInfinity: "pos", negativeInfinity: "neg", nan: "nan"))
        var result = try decoder.decode(Foo.self, from: ["number": "pos"])
        XCTAssertEqual(result, .init(number: .infinity))
        result = try decoder.decode(Foo.self, from: ["number": "neg"])
        XCTAssertEqual(result, .init(number: -.infinity))
        result = try decoder.decode(Foo.self, from: ["number": "nan"])
        XCTAssertTrue(result.number.isNaN)
    }
}
