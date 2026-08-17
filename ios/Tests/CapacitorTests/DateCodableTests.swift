import Foundation
import Testing
import Capacitor

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
private let formatted = "Sep 5, 2024 at 5:36:20 PM CDT"

private struct Foo: Codable, Equatable {
    var date: Date
}

struct JSValueDecoderDateTests {
    @Test func decodingDateDefault() throws {
        let reference = timeIntervalSinceReferenceDate
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Date.self, from: reference)
        #expect(result == referenceDate)
    }

    @Test func decodingDateSecondsSince1970() throws {
        let decoder = JSValueDecoder(dateDecodingStrategy: .secondsSince1970)
        let result = try decoder.decode(Date.self, from: secondsSince1970)
        #expect(result == referenceDate)
    }

    @Test func decodingDateMillisecondsSince1970() throws {
        let decoder = JSValueDecoder(dateDecodingStrategy: .millisecondsSince1970)
        let result = try decoder.decode(Date.self, from: millisecondsSince1970)
        #expect(result == referenceDate)
    }

    @Test func decodingDateISO8601() throws {
        let decoder = JSValueDecoder(dateDecodingStrategy: .iso8601)
        let result = try decoder.decode(Date.self, from: iso8601)
        #expect(result == referenceDate)
    }

    @Test func decodingDateFormatted() throws {
        let decoder = JSValueDecoder(dateDecodingStrategy: .formatted(formatter))
        let result = try decoder.decode(Date.self, from: formatted)
        #expect(result == referenceDate)
    }

    @Test func decodingDateCustom() throws {
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
        #expect(result == referenceDate)
    }

    @Test func decodingDateArray() throws {
        let dateArray = [iso8601, iso8601]
        let decoder = JSValueDecoder(dateDecodingStrategy: .iso8601)
        let result = try decoder.decode([Date].self, from: dateArray)
        #expect(result == [referenceDate, referenceDate])
    }

    @Test func decodingDateStruct() throws {
        let value = ["date": iso8601] as JSObject
        let decoder = JSValueDecoder(dateDecodingStrategy: .iso8601)
        let result = try decoder.decode(Foo.self, from: value)
        #expect(result == Foo(date: referenceDate))
    }
}

struct JSValueEncoderDateTests {
    @Test func encodingDateDefault() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(referenceDate)
        let result = try #require(rawResult as? Double)
        #expect(result == timeIntervalSinceReferenceDate)
    }

    @Test func encodingDateSecondsSince1970() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .secondsSince1970)
        let rawResult = try encoder.encode(referenceDate)
        let result = try #require(rawResult as? Double)
        #expect(result == secondsSince1970)
    }

    @Test func encodingDateMillisecondsSince1970() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .millisecondsSince1970)
        let rawResult = try encoder.encode(referenceDate)
        let result = try #require(rawResult as? Double)
        #expect(result == millisecondsSince1970)
    }

    @Test func encodingDateISO8601() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .iso8601)
        let rawResult = try encoder.encode(referenceDate)
        let result = try #require(rawResult as? String)
        #expect(result == iso8601)
    }

    @Test func encodingDateFormatted() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .formatted(formatter))
        let rawResult = try encoder.encode(referenceDate)
        let result = try #require(rawResult as? String)
        #expect(result == formatted)
    }

    @Test func encodingDateCustom() throws {
        let strategy = JSValueEncoder.DateEncodingStrategy.custom { date, encoder in
            var container = encoder.singleValueContainer()
            try container.encode("\(date.timeIntervalSinceReferenceDate)")
        }

        let encoder = JSValueEncoder(dateEncodingStrategy: strategy)
        let rawResult = try encoder.encode(referenceDate)
        let result = try #require(rawResult as? String)
        #expect(result == "\(timeIntervalSinceReferenceDate)")
    }

    @Test func encodingDateArray() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .iso8601)
        let array = [referenceDate, referenceDate]
        let rawResult = try encoder.encode(array)
        let result = try #require(rawResult as? [String])
        #expect(result == [iso8601, iso8601])
    }

    @Test func encodingDateStruct() throws {
        let encoder = JSValueEncoder(dateEncodingStrategy: .iso8601)
        let rawResult = try encoder.encode(Foo(date: referenceDate))
        let result = try #require(rawResult as? [String: String])
        #expect(result == ["date": iso8601])
    }
}
