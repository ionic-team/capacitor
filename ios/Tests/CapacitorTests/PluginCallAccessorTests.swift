import Foundation
import Testing
@testable import Capacitor

struct PluginCallAccessorTests {
    private static let referenceDate = Date(timeIntervalSinceReferenceDate: 632854800)

    private static func makeCall() -> CAPPluginCall {
        let formatter = ISO8601DateFormatter()
        let options: [String: Any] = [
            "testString": "foo",
            "testDict": ["testSubkey": "sub value"],
            "testFloat": 3.14159,
            "testDateObject": referenceDate,
            "testDateString": formatter.string(from: referenceDate),
            "testBoolTrue": true,
            "testBoolFalse": false
        ]
        return CAPPluginCall(callbackId: "test", methodName: "test", options: options, success: { _, _ in }, error: { _ in })
    }

    @Test func stringAccessor() {
        let call = Self.makeCall()
        #expect(call.getString("testString") == "foo")
        #expect(call.getString("badString") == nil)
        #expect(call.getString("badString", defaultValue: "default") == "default")
    }

    @Test func dateObjectAccessor() {
        let call = Self.makeCall()
        #expect(call.getDate("testDateObject")?.timeIntervalSinceReferenceDate == 632854800)
        #expect(call.getDate("badString") == nil)

        let defaultDate = Date()
        #expect(call.getDate("badString", defaultValue: defaultDate) == defaultDate)
    }

    @Test func dateStringAccessor() {
        let call = Self.makeCall()
        let objectValue = call.getDate("testDateObject")
        let stringValue = call.getDate("testDateString")
        #expect(objectValue != nil)
        #expect(stringValue != nil)
        #expect(objectValue == stringValue)
    }

    @Test func objectAccessor() {
        let call = Self.makeCall()
        let value = call.getObject("testDict")
        #expect(value?["testSubkey"] as? String == "sub value")
        #expect(call.getObject("badString") == nil)
    }

    @Test func numberAccessor() {
        let call = Self.makeCall()
        var value = call.getNumber("testFloat")
        #expect(value == NSNumber(value: 3.14159))

        value = call.getNumber("badString")
        #expect(value == nil)

        value = call.getNumber("badString", defaultValue: 100)
        #expect(value?.intValue == 100)

        value = call.getNumber("testBoolTrue")
        #expect(value?.boolValue == true)
    }

    @Test func boolAccessor() {
        let call = Self.makeCall()
        #expect(call.getBool("testBoolTrue", defaultValue: false) == true)
        #expect(call.getBool("testBoolFalse", defaultValue: true) == false)
        #expect(call.getBool("badString", defaultValue: true) == true)
        #expect(call.getBool("badString", defaultValue: false) == false)
    }
}
