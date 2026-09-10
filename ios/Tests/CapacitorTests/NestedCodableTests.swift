import Foundation
import Testing
import Capacitor

struct NestedCodableTests {
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

    @Test func decodingNestedValueWithCustomImplementation() throws {
        let decoder = JSValueDecoder()
        let decoded = try decoder.decode(Flattened.self, from: nestedData)
        #expect(decoded == flatData)
    }

    @Test func encodingNestedValueWithCustomImplementation() throws {
        let encoder = JSValueEncoder()
        let encoded = try #require(try encoder.encode(flatData) as? JSObject)

        let encodedId = try #require(encoded["id"] as? NSNumber)
        let encodedUser = try #require(encoded["user"] as? JSObject)
        let encodedUserName = try #require(encodedUser["userName"] as? String)
        let encodedRealInfo = try #require(encodedUser["realInfo"] as? JSObject)
        let encodedFullName = try #require(encodedRealInfo["fullName"] as? String)
        let encodedReviewCount = try #require(encoded["reviewCount"] as? JSArray)
        let encodedCountEntry = try #require(encodedReviewCount[0] as? JSObject)
        let encodedCount = try #require(encodedCountEntry["count"] as? NSNumber)

        #expect(encodedId == flatData.id as NSNumber)
        #expect(encodedUserName == flatData.userName)
        #expect(encodedFullName == flatData.fullName)
        #expect(encodedCount == flatData.reviewCount as NSNumber)
    }
}

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
