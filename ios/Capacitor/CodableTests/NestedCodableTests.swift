//
//  CodableTests.swift
//  CodableTests
//
//  Created by Steven Sherry on 12/10/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

import XCTest
import Capacitor

final class NestedCodableTests: XCTestCase {
    private let nestedData: JSObject = [
        "id": 1,
        "user": [
            "userName": "Tester",
            "realInfo": [
                "fullName": "John Doe"
            ] as JSObject
        ],
        "reviewCount": [
            ["count": 4] as JSObject
        ]
    ]

    private let flatData = Flattened(
        id: 1,
        userName: "Tester",
        fullName: "John Doe",
        reviewCount: 4
    )

    func testDecode__when_decoding_a_decodable_value_with_a_custom_implementation_with_nested_values__it_successfully_decodes() throws {
        let decoder = JSValueDecoder()
        let decoded = try decoder.decode(Flattened.self, from: nestedData)
        XCTAssertEqual(decoded, flatData)
    }

    func testEncode__when_encoding_an_encodable_value_with_a_custom_implementation_with_nested_values__it_successfully_encodes() throws {
        let encoder = JSValueEncoder()
        let encoded = try XCTUnwrap(try encoder.encode(flatData) as? JSObject)

        print(encoded)
        let encodedId = try XCTUnwrap(encoded["id"] as? NSNumber)
        let encodedUser = try XCTUnwrap(encoded["user"] as? JSObject)
        let encodedUserName = try XCTUnwrap(encodedUser["userName"] as? String)
        let encodedRealInfo = try XCTUnwrap(encodedUser["realInfo"] as? JSObject)
        let encodedFullName = try XCTUnwrap(encodedRealInfo["fullName"] as? String)
        let encodedReviewCount = try XCTUnwrap(encoded["reviewCount"] as? JSArray)
        let encodedCountEntry = try XCTUnwrap(encodedReviewCount[0] as? JSObject)
        let encodedCount = try XCTUnwrap(encodedCountEntry["count"] as? NSNumber)

        XCTAssertEqual(encodedId, flatData.id as NSNumber)
        XCTAssertEqual(encodedUserName, flatData.userName)
        XCTAssertEqual(encodedFullName, flatData.fullName)
        XCTAssertEqual(encodedCount, flatData.reviewCount as NSNumber)
    }
}

// Example taken from https://stackoverflow.com/questions/44549310/how-to-decode-a-nested-json-struct-with-swift-decodable-protocol
private struct Flattened: Equatable {
    let id: Int
    let userName: String
    let fullName: String
    let reviewCount: Int
}

extension Flattened: Decodable {
    enum RootKeys: String, CodingKey {
        case id, user, reviewCount
    }

    enum UserKeys: String, CodingKey {
        case userName, realInfo
    }

    enum RealInfoKeys: String, CodingKey {
        case fullName
    }

    enum ReviewCountKeys: String, CodingKey {
        case count
    }

    init(from decoder: Decoder) throws {
        // id
        let container = try decoder.container(keyedBy: RootKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        let userContainer = try container.nestedContainer(keyedBy: UserKeys.self, forKey: .user)
        userName = try userContainer.decode(String.self, forKey: .userName)
        let realInfoKeysContainer = try userContainer.nestedContainer(keyedBy: RealInfoKeys.self, forKey: .realInfo)
        fullName = try realInfoKeysContainer.decode(String.self, forKey: .fullName)

        var reviewUnkeyedContainer = try container.nestedUnkeyedContainer(forKey: .reviewCount)
        var reviewCountArray = [Int]()
        while !reviewUnkeyedContainer.isAtEnd {
            let reviewCountContainer = try reviewUnkeyedContainer.nestedContainer(keyedBy: ReviewCountKeys.self)
            reviewCountArray.append(try reviewCountContainer.decode(Int.self, forKey: .count))
        }
        guard let reviewCount = reviewCountArray.first else {
            throw DecodingError.dataCorrupted(DecodingError.Context(codingPath: container.codingPath + [RootKeys.reviewCount], debugDescription: "reviews_count cannot be empty"))
        }
        self.reviewCount = reviewCount
    }
}

extension Flattened: Encodable {
    func encode(to encoder: Encoder) throws {
        var topLevelContainer = encoder.container(keyedBy: RootKeys.self)
        try topLevelContainer.encode(id, forKey: .id)
        var userContainer = topLevelContainer.nestedContainer(keyedBy: UserKeys.self, forKey: .user)
        try userContainer.encode(userName, forKey: .userName)
        var infoContainer = userContainer.nestedContainer(keyedBy: RealInfoKeys.self, forKey: .realInfo)
        try infoContainer.encode(fullName, forKey: .fullName)
        var reviewsContainer = topLevelContainer.nestedUnkeyedContainer(forKey: .reviewCount)

        try reviewsContainer.encode(["count": reviewCount])
    }
}
