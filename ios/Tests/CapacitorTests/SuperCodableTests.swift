import Foundation
import Testing
import Capacitor

struct SuperCodableTests {
    @Test func encodingKeyedSuperEncoderWithoutKeyUsesDefaultKey() throws {
        let sut = JSValueEncoder()
        let value = KeyedSubSuper(bool: true)
        let encoded = try sut.encodeJSObject(value)

        let bool = try #require(encoded["bool"] as? Bool)
        #expect(bool == true)
        let superObject = try #require(encoded["super"] as? JSObject)
        let number = try #require(superObject["number"] as? NSNumber)
        #expect(number == 0)
        let string = try #require(superObject["string"] as? String)
        #expect(string == "empty")
    }

    @Test func encodingKeyedSuperEncoderWithSpecificKey() throws {
        let sut = JSValueEncoder()
        let value = KeyedSubSuperKeyed(bool: false)
        value.number = 5
        value.string = "encoding"
        let encoded = try sut.encodeJSObject(value)

        let bool = try #require(encoded["bool"] as? Bool)
        #expect(bool == false)
        let superObject = try #require(encoded["info"] as? JSObject)
        let number = try #require(superObject["number"] as? NSNumber)
        #expect(number == 5)
        let string = try #require(superObject["string"] as? String)
        #expect(string == "encoding")
    }

    @Test func encodingSuperclassWithoutSuperEncoderFlattenStructure() throws {
        let sut = JSValueEncoder()
        let value = KeyedSubSuperFlat(bool: true)
        value.number = 10
        value.string = "flattened"
        let encoded = try sut.encodeJSObject(value)

        let bool = try #require(encoded["bool"] as? Bool)
        #expect(bool == true)
        let number = try #require(encoded["number"] as? NSNumber)
        #expect(number == 10)
        let string = try #require(encoded["string"] as? String)
        #expect(string == "flattened")
    }

    @Test func decodingSuperclassWithoutKeyUsesSuperKey() throws {
        let sut = JSValueDecoder()
        let value: JSObject = [
            "super": [
                "number": 5,
                "string": "super decoding"
            ],
            "bool": true
        ]

        let decoded = try sut.decode(KeyedSubSuper.self, from: value)
        #expect(decoded.bool == true)
        #expect(decoded.number == 5)
        #expect(decoded.string == "super decoding")
    }

    @Test func decodingSuperclassWithSpecificKey() throws {
        let sut = JSValueDecoder()
        let value: JSObject = [
            "info": [
                "number": 9,
                "string": "info decoding"
            ],
            "bool": false
        ]

        let decoded = try sut.decode(KeyedSubSuperKeyed.self, from: value)
        #expect(decoded.bool == false)
        #expect(decoded.number == 9)
        #expect(decoded.string == "info decoding")
    }

    @Test func decodingSuperclassWithoutSuperContainerDecodeFlatStructure() throws {
        let sut = JSValueDecoder()
        let value: JSObject = [
            "number": 20,
            "string": "flat decoding",
            "bool": true
        ]

        let decoded = try sut.decode(KeyedSubSuperFlat.self, from: value)
        #expect(decoded.bool == true)
        #expect(decoded.number == 20)
        #expect(decoded.string == "flat decoding")
    }

    @Test func encodingUnkeyedSuperEncoderNestedArray() throws {
        let sut = JSValueEncoder()
        let value = UnkeyedSubSuper(bool: true)
        value.number = -3
        value.string = "unkeyed encoding"

        let encoded = try #require(try sut.encode(value) as? JSArray)
        #expect(encoded[0] as? Bool == true)
        let nested = try #require(encoded[1] as? JSArray)
        #expect(nested[0] as? NSNumber == -3)
        #expect(nested[1] as? String == "unkeyed encoding")
    }

    @Test func decodingUnkeyedSuperEncoderNestedArray() throws {
        let sut = JSValueDecoder()
        let value: JSArray = [
            true, [4, "unkeyed decoding"]
        ]

        let decoded = try sut.decode(UnkeyedSubSuper.self, from: value)
        #expect(decoded.bool == true)
        #expect(decoded.number == 4)
        #expect(decoded.string == "unkeyed decoding")
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
