import Foundation
import Testing
import Capacitor

private let urlString = "https://capacitorjs.com"
private let url = URL(string: urlString)!

private struct Website: Codable, Equatable {
    var url: URL
}

struct JSValueDecoderURLTests {
    let decoder = JSValueDecoder()

    @Test func decodingURLRoot() throws {
        let result = try decoder.decode(URL.self, from: urlString)
        #expect(result == url)
    }

    @Test func decodingURLArray() throws {
        let result = try decoder.decode([URL].self, from: [urlString, urlString])
        #expect(result == [url, url])
    }

    @Test func decodingURLStruct() throws {
        let result = try decoder.decode(Website.self, from: ["url": urlString])
        #expect(result == .init(url: url))
    }

    @Test func decodingURLFailsWithInvalidString() throws {
        let decoder = JSValueDecoder()
        #expect(throws: DecodingError.self) {
            try decoder.decode(URL.self, from: "🐞://🐞.com/🐞")
        }
    }
}

struct JSValueEncoderURLTests {
    let encoder = JSValueEncoder()

    @Test func encodingURLRoot() throws {
        let rawResult = try encoder.encode(url)
        let result = try #require(rawResult as? String)
        #expect(result == urlString)
    }

    @Test func encodingURLArray() throws {
        let rawResult = try encoder.encode([url, url])
        let result = try #require(rawResult as? [String])
        #expect(result == [urlString, urlString])
    }

    @Test func encodingURLStruct() throws {
        let rawResult = try encoder.encode(Website(url: url))
        let result = try #require(rawResult as? [String: String])
        #expect(result == ["url": urlString])
    }
}
