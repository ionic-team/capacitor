import Testing
import Capacitor

private struct Foo: Codable, Equatable {
    var number: Double
}

struct JSValueEncoderNonConformingFloatTests {
    @Test func encodingFloatDefaultRoot() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(Double.infinity)
        let result = try #require(rawResult as? Double)
        #expect(result == .infinity)
    }

    @Test func encodingFloatDefaultArray() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode([Double.infinity, -.infinity, .nan])
        let result = try #require(rawResult as? [Double])
        #expect(result[0...1] == [.infinity, -.infinity])
        #expect(result[2].isNaN)
    }

    @Test func encodingFloatDefaultStruct() throws {
        let encoder = JSValueEncoder()
        let rawResult = try encoder.encode(Foo.init(number: .infinity))
        let result = try #require(rawResult as? [String: Double])
        #expect(result == ["number": .infinity])
    }

    @Test func encodingFloatConvertToStringRoot() throws {
        let encoder = JSValueEncoder(
            nonConformingFloatEncodingStategy: .convertToString(
                positiveInfinity: "pos",
                negativeInfinity: "neg",
                nan: "nan"
            )
        )

        var rawResult = try encoder.encode(Double.infinity)
        var result = try #require(rawResult as? String)
        #expect(result == "pos")

        rawResult = try encoder.encode(-Double.infinity)
        result = try #require(rawResult as? String)
        #expect(result == "neg")

        rawResult = try encoder.encode(Double.nan)
        result = try #require(rawResult as? String)
        #expect(result == "nan")
    }

    @Test func encodingFloatConvertToStringArray() throws {
        let encoder = JSValueEncoder(
            nonConformingFloatEncodingStategy: .convertToString(
                positiveInfinity: "pos",
                negativeInfinity: "neg",
                nan: "nan"
            )
        )

        let rawResult = try encoder.encode([Double.infinity, -.infinity, .nan])
        let result = try #require(rawResult as? [String])
        #expect(result == ["pos", "neg", "nan"])
    }

    @Test func encodingFloatConvertToStringStruct() throws {
        let encoder = JSValueEncoder(
            nonConformingFloatEncodingStategy: .convertToString(
                positiveInfinity: "pos",
                negativeInfinity: "neg",
                nan: "nan"
            )
        )

        var rawResult = try encoder.encode(Foo(number: .infinity))
        var result = try #require(rawResult as? [String: String])
        #expect(result == ["number": "pos"])

        rawResult = try encoder.encode(Foo(number: -.infinity))
        result = try #require(rawResult as? [String: String])
        #expect(result == ["number": "neg"])

        rawResult = try encoder.encode(Foo(number: .nan))
        result = try #require(rawResult as? [String: String])
        #expect(result == ["number": "nan"])
    }

    @Test func encodingFloatThrowRoot() throws {
        let encoder = JSValueEncoder(nonConformingFloatEncodingStategy: .throw)
        #expect(throws: EncodingError.self) {
            try encoder.encode(Double.infinity)
        }
    }

    @Test func encodingFloatThrowArray() throws {
        let encoder = JSValueEncoder(nonConformingFloatEncodingStategy: .throw)
        #expect(throws: EncodingError.self) {
            try encoder.encode([Double.infinity, -.infinity, .nan])
        }
    }

    @Test func encodingFloatThrowStruct() throws {
        let encoder = JSValueEncoder(nonConformingFloatEncodingStategy: .throw)
        #expect(throws: EncodingError.self) {
            try encoder.encode(Foo(number: .infinity))
        }
    }
}

struct JSValueDecoderNonConformingFloatTests {
    @Test func decodingFloatDefaultRoot() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Double.self, from: Double.infinity)
        #expect(result == .infinity)
    }

    @Test func decodingFloatDefaultArray() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode([Double].self, from: [Double.infinity, Double.infinity])
        #expect(result == [.infinity, .infinity])
    }

    @Test func decodingFloatDefaultStruct() throws {
        let decoder = JSValueDecoder()
        let result = try decoder.decode(Foo.self, from: ["number": Double.infinity])
        #expect(result == .init(number: .infinity))
    }

    @Test func decodingFloatThrowRoot() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .throw)
        #expect(throws: DecodingError.self) {
            try decoder.decode(Double.self, from: Double.infinity)
        }
    }

    @Test func decodingFloatThrowArray() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .throw)
        #expect(throws: DecodingError.self) {
            try decoder.decode([Double].self, from: [Double.infinity, Double.infinity])
        }
    }

    @Test func decodingFloatThrowStruct() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .throw)
        #expect(throws: DecodingError.self) {
            try decoder.decode(Foo.self, from: ["number": Double.infinity])
        }
    }

    @Test func decodingFloatConvertFromStringRoot() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .convertFromString(positiveInfinity: "pos", negativeInfinity: "neg", nan: "nan"))
        var result = try decoder.decode(Double.self, from: "pos")
        #expect(result == .infinity)
        result = try decoder.decode(Double.self, from: "neg")
        #expect(result == -.infinity)
        result = try decoder.decode(Double.self, from: "nan")
        #expect(result.isNaN)
    }

    @Test func decodingFloatConvertFromStringArray() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .convertFromString(positiveInfinity: "pos", negativeInfinity: "neg", nan: "nan"))
        let result = try decoder.decode([Double].self, from: ["pos", "neg", "nan"])
        #expect(result[0...1] == [.infinity, -.infinity])
        #expect(result[2].isNaN)
    }

    @Test func decodingFloatConvertFromStringStruct() throws {
        let decoder = JSValueDecoder(nonConformingFloatDecodingStrategy: .convertFromString(positiveInfinity: "pos", negativeInfinity: "neg", nan: "nan"))
        var result = try decoder.decode(Foo.self, from: ["number": "pos"])
        #expect(result == .init(number: .infinity))
        result = try decoder.decode(Foo.self, from: ["number": "neg"])
        #expect(result == .init(number: -.infinity))
        result = try decoder.decode(Foo.self, from: ["number": "nan"])
        #expect(result.number.isNaN)
    }
}
