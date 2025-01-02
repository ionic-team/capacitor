//
//  DateCodableTests.swift
//  CodableTests
//
//  Created by Steven Sherry on 9/6/24.
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import XCTest
import Capacitor

// Fixture data that all refers to the same Date and Time
private let timeIntervalSinceReferenceDate: TimeInterval = 747268580
private let referenceDate = Date(timeIntervalSinceReferenceDate: timeIntervalSinceReferenceDate)
private let secondsSince1970 = 1725575780 as Double
private let millisecondsSince1970 = 1725575780000 as Double
private let iso8601 = "2024-09-05T22:36:20Z"

private let formatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .long
    formatter.timeZone = .init(abbreviation: "CDT")
    formatter.locale = .init(identifier: "en_US")
    return formatter
}()
private let formatted = "Sep 5, 2024 at 5:36:20 PM CDT"

private struct Foo: Codable, Equatable {
    var date: Date
}

final class JSValueDecoderDateTests: XCTestCase {
    func testDecode_date__default() throws {
        let reference = timeIntervalSinceReferenceDate
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Date.self, from: reference)
        XCTAssertEqual(result, referenceDate)
    }

    func testDecode_date__secondsSince1970() throws {
        let decoder = JSValueDecoder(dateDecodingStrategy: .secondsSince1970)
        let result = try decoder.decode(Date.self, from: secondsSince1970)
        XCTAssertEqual(result, referenceDate)
    }

    func testDecode_date__millisecondsSince1970() throws {
        let decoder = JSValueDecoder(dateDecodingStrategy: .millisecondsSince1970)
        let result = try decoder.decode(Date.self, from: millisecondsSince1970)
        XCTAssertEqual(result, referenceDate)
    }

    func testDecode_date__iso8601() throws {
        let decoder = JSValueDecoder(dateDecodingStrategy: .iso8601)
        let result = try decoder.decode(Date.self, from: iso8601)
        XCTAssertEqual(result, referenceDate)
    }

    func testDecode_date__formatted() throws {
        let decoder = JSValueDecoder(dateDecodingStrategy: .formatted(formatter))
        let result = try decoder.decode(Date.self, from: formatted)
        XCTAssertEqual(result, referenceDate)
    }

    func testDecode_date__custom() throws {
        let strategy = JSValueDecoder.DateDecodingStrategy.custom { decoder in
            let container = try decoder.singleValueContainer()
            let referenceDateString = try container.decode(String.self)
            guard let referenceDateSeconds = Double(referenceDateString) else {
                throw DecodingError.dataCorrupted(.init(codingPath: container.codingPath, debugDescription: "Unable to decode Double from String"))
            }
            return Date(timeIntervalSinceReferenceDate: referenceDateSeconds)
        }

        let referenceString = "\(timeIntervalSinceReferenceDate)"
        let decoder = JSValueDecoder(dateDecodingStrategy: strategy)
        let result = try decoder.decode(Date.self, from: referenceString)
        XCTAssertEqual(result, referenceDate)
    }

    func testDecode_date__array() throws {
        let dateArray = [iso8601, iso8601]
        let decoder = JSValueDecoder(dateDecodingStrategy: .iso8601)
        let result = try decoder.decode([Date].self, from: dateArray)
        XCTAssertEqual(result, [referenceDate, referenceDate])
    }

    func testDecode_date__struct() throws {
        let value = ["date": iso8601] as JSObject
        let decoder = JSValueDecoder(dateDecodingStrategy: .iso8601)
        let result = try decoder.decode(Foo.self, from: value)
        XCTAssertEqual(result, Foo(date: referenceDate))
    }
}

final class JSValueEncoderDateTests: XCTestCase {
    func testEncode_date__default() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(referenceDate)
        let result = try XCTUnwrap(rawResult as? Double)
        XCTAssertEqual(result, timeIntervalSinceReferenceDate)
    }

    func testEncode_date__secondsSince1970() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .secondsSince1970)
        let rawResult = try encoder.encode(referenceDate)
        let result = try XCTUnwrap(rawResult as? Double)
        XCTAssertEqual(result, secondsSince1970)
    }

    func testEncode_date__millisecondsSince1970() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .millisecondsSince1970)
        let rawResult = try encoder.encode(referenceDate)
        let result = try XCTUnwrap(rawResult as? Double)
        XCTAssertEqual(result, millisecondsSince1970)
    }

    func testEncode_date__iso8601() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .iso8601)
        let rawResult = try encoder.encode(referenceDate)
        let result = try XCTUnwrap(rawResult as? String)
        XCTAssertEqual(result, iso8601)
    }

    func testEncode_date__formatted() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .formatted(formatter))
        let rawResult = try encoder.encode(referenceDate)
        let result = try XCTUnwrap(rawResult as? String)
        XCTAssertEqual(result, formatted)
    }

    func testEncode_date__custom() throws {
        let strategy = JSValueEncoder.DateEncodingStrategy.custom { date, encoder in
            var container = encoder.singleValueContainer()
            try container.encode("\(date.timeIntervalSinceReferenceDate)")
        }

        let encoder = JSValueEncoder(dateEncodingStrategy: strategy)
        let rawResult = try encoder.encode(referenceDate)
        let result = try XCTUnwrap(rawResult as? String)
        XCTAssertEqual(result, "\(timeIntervalSinceReferenceDate)")
    }

    func testEncode_date__array() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .iso8601)
        let array = [referenceDate, referenceDate]
        let rawResult = try encoder.encode(array)
        let result = try XCTUnwrap(rawResult as? [String])
        XCTAssertEqual(result, [iso8601, iso8601])
    }

    func testEncode_date__struct() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .iso8601)
        let rawResult = try encoder.encode(Foo(date: referenceDate))
        let result = try XCTUnwrap(rawResult as? [String: String])
        XCTAssertEqual(result, ["date": iso8601])
    }
}
