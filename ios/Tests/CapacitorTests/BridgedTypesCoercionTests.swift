import Foundation
import Testing
@testable import Capacitor

private enum BridgedTypesCoercionError: Error {
    case badCast
}

private enum BridgedTypesCoercionHelper {
    static func validTransformation(of array: [Any]) -> [Any] {
        let result = JSTypes.coerceArrayToJSArray(array)!.capacitor.replacingNullValues()
        return result.capacitor.replacingOptionalValues() as [Any]
    }

    static func invalidTransformation(of array: [Any]) -> [Any] {
        let result = JSTypes.coerceArrayToJSArray(array)!.capacitor.replacingNullValues()
        return result as [Any]
    }

    static func testCast(of array: [Any], atIndex index: Int) throws -> Any {
        if let castArray = array as? [JSValue] {
            return castArray[index] as Any
        }
        throw BridgedTypesCoercionError.badCast
    }
}

struct BridgedTypesCoercionTests {
    @Test func nullHandling() throws {
        let source: [Any] = ["test", NSNull(), 3]
        let result = BridgedTypesCoercionHelper.validTransformation(of: source)

        // the replaced null value exists
        let value = result[1]
        #expect(value is NSNull)

        // the null value casts to non-optional
        let castValue = try BridgedTypesCoercionHelper.testCast(of: result, atIndex: 1)
        #expect(castValue is NSNull)
    }

    @Test func optionalHandling() throws {
        let source: [Any] = ["test", NSNull(), 3]
        let result = BridgedTypesCoercionHelper.invalidTransformation(of: source)

        // bridging the optional-holding array to NSArray (as happens when passing values across
        // the JS bridge) coerces the removed null value's `nil` back into an NSNull
        let value = (result as NSArray).object(at: 1)
        #expect(value is NSNull)

        // the optional value fails to cast to non-optional
        #expect(throws: BridgedTypesCoercionError.badCast) {
            try BridgedTypesCoercionHelper.testCast(of: result, atIndex: 1)
        }
    }
}
