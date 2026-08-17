import Foundation
import Testing
@testable import Capacitor

private class TestContainer: NSObject, JSValueContainer {
    var coercedDictionary: [AnyHashable: Any] = [:]

    public static var jsDateFormatter: ISO8601DateFormatter = {
        return ISO8601DateFormatter()
    }()

    public var jsObjectRepresentation: JSObject {
        return coercedDictionary as? JSObject ?? [:]
    }
}

struct BridgedTypesTests {
    private static let fixture = BridgedTypesFixture()

    private struct BridgedTypesFixture {
        let unserializedDictionary: [AnyHashable: Any]
        let deserializedDictionary: [AnyHashable: Any]

        init() {
            let formatter = ISO8601DateFormatter()
            let date = NSDate(timeIntervalSinceReferenceDate: 632854800)
            let subDictionary: [AnyHashable: Any] = [
                "testIntArray": [0, 1, 2],
                "testStringArray": ["1", "2", "3"],
                "testDictionary": ["foo": "bar"]
            ]
            var dictionary: [AnyHashable: Any] = [
                "testInt": 1 as Int,
                "testFloat": Float.pi,
                "testBool": true as Bool,
                "testString": "Some string value",
                "testChild": subDictionary,
                "testDateString": formatter.string(from: date as Date)
            ]
            let serializer = JSONSerializationWrapper(dictionary: dictionary)!
            var unwrappedResult = serializer.unwrappedResult()!
            unwrappedResult["testDateObject"] = date
            dictionary["testDateObject"] = date
            self.unserializedDictionary = dictionary
            self.deserializedDictionary = unwrappedResult
        }
    }

    @Test func testTranslation() throws {
        let unserializedDictionary = Self.fixture.unserializedDictionary
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let testContainer = TestContainer()
        testContainer.coercedDictionary = JSTypes.coerceDictionaryToJSObject(deserializedDictionary)!

        #expect(unserializedDictionary.count > 0)
        #expect(deserializedDictionary.count > 0)
        #expect(testContainer.coercedDictionary.count > 0)
    }

    @Test func testCastingFailure() throws {
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let unserializedDictionary = Self.fixture.unserializedDictionary

        var castResult = deserializedDictionary as? JSObject
        #expect(castResult == nil)

        castResult = unserializedDictionary as? JSObject
        #expect(castResult == nil)
    }

    @Test func testCoercionSuccess() throws {
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let coercedResult = JSTypes.coerceDictionaryToJSObject(deserializedDictionary)
        #expect(coercedResult != nil)
    }

    @Test func testRoundtripEquality() throws {
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let unserializedDictionary = Self.fixture.unserializedDictionary
        let coercedResult = JSTypes.coerceDictionaryToJSObject(deserializedDictionary)!
        let foo: NSDictionary = coercedResult as NSDictionary
        let bar: NSDictionary = unserializedDictionary as NSDictionary

        #expect(foo == bar)
    }

    @Test func testTypeEquivalency() throws {
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let unserializedDictionary = Self.fixture.unserializedDictionary
        let coercedResult = JSTypes.coerceDictionaryToJSObject(deserializedDictionary)!
        let coercedFloat = coercedResult["testFloat"] as? Float
        let sourceFloat = unserializedDictionary["testFloat"] as? Float
        let resultFloat = deserializedDictionary["testFloat"] as? Float

        #expect(coercedFloat != nil)
        #expect(sourceFloat != nil)
        #expect(resultFloat != nil)

        #expect(coercedFloat == sourceFloat)
        #expect(sourceFloat == resultFloat)
        #expect(coercedFloat == Float.pi)
    }

    @Test func testNumberWrapping() throws {
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let unserializedDictionary = Self.fixture.unserializedDictionary
        let testContainer = TestContainer()
        testContainer.coercedDictionary = JSTypes.coerceDictionaryToJSObject(deserializedDictionary)!

        let sourceFloat = unserializedDictionary["testFloat"]!
        #expect(type(of: sourceFloat) == Float.self)

        let wrappedFloat = deserializedDictionary["testFloat"]!
        let underlyingType: AnyObject.Type = NSClassFromString("__NSCFNumber")!
        #expect(type(of: wrappedFloat) == underlyingType.self)

        let coercedResult = JSTypes.coerceDictionaryToJSObject(deserializedDictionary)!
        let coercedFloat = coercedResult["testFloat"]!
        #expect(type(of: coercedFloat) == underlyingType.self)

        let castFloat = testContainer.getFloat("testFloat")!
        #expect(type(of: castFloat) == Float.self)
        #expect((sourceFloat as! Float) == castFloat)
    }

    @Test func testDateObject() throws {
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let coercedResult = JSTypes.coerceDictionaryToJSObject(deserializedDictionary)!
        let date = coercedResult["testDateObject"] as! Date
        #expect(date != nil)
        #expect(type(of: date) == Date.self)
    }

    @Test func testDateParsing() throws {
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let coercedResult = JSTypes.coerceDictionaryToJSObject(deserializedDictionary)!
        let formatter = ISO8601DateFormatter()
        let parsedDate = formatter.date(from: coercedResult["testDateString"] as! String)!
        let dateObject = coercedResult["testDateObject"] as! Date
        #expect(parsedDate != nil)
        #expect(dateObject != nil)
        #expect(dateObject.compare(parsedDate) == .orderedSame)
    }

    @Test func testDateExtensions() throws {
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let testContainer = TestContainer()
        testContainer.coercedDictionary = JSTypes.coerceDictionaryToJSObject(deserializedDictionary)!

        let parsedDate = testContainer.getDate("testDateString")!
        let dateObject = testContainer.getDate("testDateObject")!
        #expect(parsedDate != nil)
        #expect(dateObject != nil)
        #expect(dateObject.compare(parsedDate) == .orderedSame)
    }

    @Test func testDateCoercion() throws {
        let deserializedDictionary = Self.fixture.deserializedDictionary
        let stringifiedDictionary = JSTypes.coerceDictionaryToJSObject(deserializedDictionary, formattingDatesAsStrings: true)!
        let unstringifiedDictionary = JSTypes.coerceDictionaryToJSObject(deserializedDictionary, formattingDatesAsStrings: false)!
        let stringifiedValue = stringifiedDictionary["testDateObject"]!
        let unstringifiedValue = unstringifiedDictionary["testDateObject"]!
        #expect(type(of: stringifiedValue) == String.self)
        #expect(type(of: unstringifiedValue) == Date.self)
        #expect((stringifiedValue as! String) == (stringifiedDictionary["testDateString"] as! String))
    }

    @Test func testDateResultWrapping() throws {
        let unserializedDictionary = Self.fixture.unserializedDictionary
        let result = try PluginCallResult.dictionary(["date": unserializedDictionary["testDateObject"]!]).jsonRepresentation()
        #expect(result == "{\"date\":\"\(unserializedDictionary["testDateString"] as! String)\"}")
    }

    @Test func testResultMerging() throws {
        let result = try PluginCallResult.dictionary(["number": 1]).jsonRepresentation(includingFields: ["string": "foo"])
        let isValid = result == "{\"string\":\"foo\",\"number\":1}" || result == "{\"number\":1,\"string\":\"foo\"}"
        #expect(isValid)
    }

    @Test func testNullWrapping() throws {
        let dictionary: [AnyHashable: Any] = ["testInt": 1 as Int, "testNull": NSNull()]
        let coercedDictionary = JSTypes.coerceDictionaryToJSObject(dictionary)!
        #expect(coercedDictionary != nil)
        #expect(coercedDictionary.count == 2)
        #expect(coercedDictionary["testNull"]! is NSNull)
    }

    @Test func testNullTransformation() throws {
        let array: [Any] = [1, NSNull(), "test string"]
        let coercedArray = JSTypes.coerceArrayToJSArray(array)!
        #expect(coercedArray != nil)
        #expect(coercedArray.count == 3)
        #expect(type(of: coercedArray[1]) == NSNull.self)
        let filteredArray = coercedArray.capacitor.replacingNullValues()
        #expect(filteredArray.count == 3)
        #expect(filteredArray[1] == nil)
        let restoredArray = filteredArray.capacitor.replacingOptionalValues()
        #expect(restoredArray.count == 3)
        #expect(restoredArray[1] != nil)
        #expect(restoredArray[0] is NSNumber)
        #expect(restoredArray[1] is NSNull)
        #expect(restoredArray[2] is String)
    }

    @Test func testSparseArrayCastSuccess() throws {
        let array: [Any] = ["test string 1", "test string 2", NSNull()]
        let sparseArray = JSTypes.coerceArrayToJSArray(array)?.capacitor.replacingNullValues() as? [String?]
        #expect(sparseArray != nil)
        #expect(sparseArray!.count == 3)
        #expect(sparseArray![2] == nil)
    }

    @Test func testSparseArrayCastFailure() throws {
        let array: [Any] = ["test string 1", 1, NSNull()]
        let sparseArray = JSTypes.coerceArrayToJSArray(array)?.capacitor.replacingNullValues() as? [String?]
        #expect(sparseArray == nil)
    }
}
