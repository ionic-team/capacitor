import Foundation
import Testing
import Capacitor

private struct Foo: Codable, Equatable {
    var data: Data
}

private let jsonString = #"{ "key": "value" }"#
private let jsonData = jsonString.data(using: .utf8)!
private let jsonByteArray: [NSNumber] = [123, 32, 34, 107, 101, 121, 34, 58, 32, 34, 118, 97, 108, 117, 101, 34, 32, 125]
private let jsonBase64 = "eyAia2V5IjogInZhbHVlIiB9"

private let customDecodingStrategy = JSValueDecoder.DataDecodingStrategy.custom { decoder in
    var container = try decoder.unkeyedContainer()
    var byteArray: [UInt8] = []
    while !container.isAtEnd {
        byteArray.append(try container.decode(UInt8.self))
    }
    return Data(byteArray)
}

private let customEncodingStrategy = JSValueEncoder.DataEncodingStrategy.custom { data, encoder in
    let byteArray = data.map { $0 }
    var unkeyedContainer = encoder.unkeyedContainer()
    try unkeyedContainer.encode(contentsOf: byteArray)
}

struct JSValueDecoderDataTests {
    @Test func decodingDataDefaultRoot() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Data.self, from: jsonByteArray)
        #expect(result == jsonData)
    }

    @Test func decodingDataDefaultArray() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode([Data].self, from: [jsonByteArray, jsonByteArray])
        #expect(result == [jsonData, jsonData])
    }

    @Test func decodingDataDefaultStruct() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Foo.self, from: ["data": jsonByteArray])
        #expect(result == .init(data: jsonData))
    }

    @Test func decodingDataBase64Root() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: .base64)
        let result = try decoder.decode(Data.self, from: jsonBase64)
        #expect(result == jsonData)
    }

    @Test func decodingDataBase64Array() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: .base64)
        let result = try decoder.decode([Data].self, from: [jsonBase64, jsonBase64])
        #expect(result == [jsonData, jsonData])
    }

    @Test func decodingDataBase64Struct() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: .base64)
        let result = try decoder.decode(Foo.self, from: ["data": jsonBase64])
        #expect(result == .init(data: jsonData))
    }

    @Test func decodingDataCustomRoot() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: customDecodingStrategy)
        let result = try decoder.decode(Data.self, from: jsonByteArray)
        #expect(result == jsonData)
    }

    @Test func decodingDataCustomArray() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: customDecodingStrategy)
        let result = try decoder.decode([Data].self, from: [jsonByteArray, jsonByteArray])
        #expect(result == [jsonData, jsonData])
    }

    @Test func decodingDataCustomStruct() throws {
        let decoder = JSValueDecoder(dataDecodingStrategy: customDecodingStrategy)
        let result = try decoder.decode(Foo.self, from: ["data": jsonByteArray])
        #expect(result == .init(data: jsonData))
    }
}

struct JSValueEncoderDataTests {
    @Test func encodingDataDefaultRoot() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(jsonData)
        let result = try #require(rawResult as? [NSNumber])
        #expect(result == jsonByteArray)
    }

    @Test func encodingDataDefaultArray() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode([jsonData, jsonData])
        let result = try #require(rawResult as? [[NSNumber]])
        #expect(result == [jsonByteArray, jsonByteArray])
    }

    @Test func encodingDataDefaultStruct() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(Foo(data: jsonData))
        let result = try #require(rawResult as? [String: [NSNumber]])
        #expect(result == ["data": jsonByteArray])
    }

    @Test func encodingDataBase64Root() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: .base64)
        let rawResult = try encoder.encode(jsonData)
        let result = try #require(rawResult as? String)
        #expect(result == jsonBase64)
    }

    @Test func encodingDataBase64Array() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: .base64)
        let rawResult = try encoder.encode([jsonData, jsonData])
        let result = try #require(rawResult as? [String])
        #expect(result == [jsonBase64, jsonBase64])
    }

    @Test func encodingDataBase64Struct() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: .base64)
        let rawResult = try encoder.encode(Foo(data: jsonData))
        let result = try #require(rawResult as? [String: String])
        #expect(result == ["data": jsonBase64])
    }

    @Test func encodingDataCustomRoot() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: customEncodingStrategy)
        let rawResult = try encoder.encode(jsonData)
        let result = try #require(rawResult as? [NSNumber])
        #expect(result == jsonByteArray)
    }

    @Test func encodingDataCustomArray() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: customEncodingStrategy)
        let rawResult = try encoder.encode([jsonData, jsonData])
        let result = try #require(rawResult as? [[NSNumber]])
        #expect(result == [jsonByteArray, jsonByteArray])
    }

    @Test func encodingDataCustomStruct() throws {
        let encoder = JSValueEncoder(dataEncodingStrategy: customEncodingStrategy)
        let rawResult = try encoder.encode(Foo(data: jsonData))
        let result = try #require(rawResult as? [String: [NSNumber]])
        #expect(result == ["data": jsonByteArray])
    }
}
