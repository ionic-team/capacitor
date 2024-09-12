//
//  URLCodableTests.swift
//  CodableTests
//
//  Created by Steven Sherry on 9/6/24.
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import XCTest
import Capacitor

private let urlString = "https://capacitorjs.com"
private let url = URL(string: urlString)!

private struct Website: Codable, Equatable {
    var url: URL
}

class JSValueDecoderURLTests: XCTestCase {
    let decoder = JSValueDecoder()

    func testDecode_url__root() throws {
        let result = try decoder.decode(URL.self, from: urlString)
        XCTAssertEqual(result, url)
    }

    func testDecode_url__array() throws {
        let result = try decoder.decode([URL].self, from: [urlString, urlString])
        XCTAssertEqual(result, [url, url])
    }

    func testDecode_url__struct() throws {
        let result = try decoder.decode(Website.self, from: ["url": urlString])
        XCTAssertEqual(result, .init(url: url))
    }

    func testDecode_url__fails_when_invalid_url_string_is_provided() {
        XCTAssertThrowsError(try decoder.decode(URL.self, from: "🐞://🐞.com/🐞"))
    }
}

class JSValueEncoderURLTests: XCTestCase {
    let encoder = JSValueEncoder()

    func testEncode_url__root() throws {
        let rawResult = try encoder.encode(url)
        let result = try XCTUnwrap(rawResult as? String)
        XCTAssertEqual(result, urlString)
    }

    func testEncode_url__array() throws {
        let rawResult = try encoder.encode([url, url])
        let result = try XCTUnwrap(rawResult as? [String])
        XCTAssertEqual(result, [urlString, urlString])
    }

    func testEncode_url__struct() throws {
        let rawResult = try encoder.encode(Website(url: url))
        let result = try XCTUnwrap(rawResult as? [String: String])
        XCTAssertEqual(result, ["url": urlString])
    }
}
