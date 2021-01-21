import XCTest

@testable import Capacitor

class BridgedTypesTests: XCTestCase {
    static var sourceDictionary: [AnyHashable: Any] = [:]
    static var resultDictionary: [AnyHashable: Any] = [:]
    
    var sourceDictionary: [AnyHashable: Any] = [:]
    var resultDictionary: [AnyHashable: Any] = [:]
    
    override class func setUp() {
        let subDictionary: [AnyHashable: Any] = ["testIntArray": [0, 1, 2], "testStringArray": ["1", "2", "3"], "testDictionary":["foo":"bar"]]
        let dictionary: [AnyHashable: Any] = ["testInt": 1 as Int, "testFloat": Float.pi, "testBool": true as Bool, "testString": "Some string value", "testChild": subDictionary]
        sourceDictionary = dictionary
        let serializer = JSONSerializationWrapper(dictionary: sourceDictionary)!
        resultDictionary = serializer.unwrappedResult()!
    }
    
    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
        sourceDictionary = BridgedTypesTests.sourceDictionary
        resultDictionary = BridgedTypesTests.resultDictionary
    }
    
    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
    
    func testTranslation() throws {
        XCTAssertNotNil(sourceDictionary)
        XCTAssertNotNil(resultDictionary)
    }
    
    func testCastingFailure() throws {
        var castResult = resultDictionary as? JSObject
        XCTAssertNil(castResult)
        
        castResult = sourceDictionary as? JSObject
        XCTAssertNil(castResult)
    }
    
    func testCoercionSuccess() throws {
        let coercedResult = JSTypes.coerceDictionaryToJSObject(resultDictionary)
        XCTAssertNotNil(coercedResult)
    }
    
    func testRoundtripEquality() throws {
        let coercedResult = JSTypes.coerceDictionaryToJSObject(resultDictionary)!
        let foo: NSDictionary = coercedResult as NSDictionary
        let bar: NSDictionary = sourceDictionary as NSDictionary
        
        XCTAssertEqual(foo, bar)
    }
    
    func testTypeEquavalency() throws {
        let coercedResult = JSTypes.coerceDictionaryToJSObject(resultDictionary)!
        let coercedFloat = coercedResult["testFloat"] as? Float
        let sourceFloat = sourceDictionary["testFloat"] as? Float
        let resultFloat = resultDictionary["testFloat"] as? Float
        
        XCTAssertNotNil(coercedFloat)
        XCTAssertNotNil(sourceFloat)
        XCTAssertNotNil(resultFloat)
        
        XCTAssertEqual(coercedFloat, sourceFloat)
        XCTAssertEqual(sourceFloat, resultFloat)
        XCTAssertEqual(coercedFloat, Float.pi)
    }
    
    func testNumberWrapping() throws {
        // the original number is a swift primitive float
        let sourceFloat = sourceDictionary["testFloat"]!
        XCTAssertTrue(type(of: sourceFloat) == Float.self)
        
        // but after serialization/deserilization, it will be wrapped as an NSNumber
        let wrappedFloat = resultDictionary["testFloat"]!
        let underlyingType: AnyObject.Type = NSClassFromString("__NSCFNumber")!
        XCTAssertTrue(type(of: wrappedFloat) == underlyingType.self)
        
        // coercision will keep the NSNumber type since there's no way to recover it
        let coercedResult = JSTypes.coerceDictionaryToJSObject(resultDictionary)!
        let coercedFloat = coercedResult["testFloat"]!
        XCTAssertTrue(type(of: coercedFloat) == underlyingType.self)
    }
    
    func testNullWrapping() throws {
        let dictionary: [AnyHashable: Any] = ["testInt": 1 as Int, "testNull": NSNull()]
        let coercedDictionary = JSTypes.coerceDictionaryToJSObject(dictionary)!
        XCTAssertNotNil(coercedDictionary)
        XCTAssertEqual(coercedDictionary.count, 2)
        XCTAssertTrue(coercedDictionary["testNull"]! is NSNull)
    }
    
    func testNullTransformation() throws {
        let array: [Any] = [1, NSNull(), "test string"]
        let coercedArray = JSTypes.coerceArrayToJSArray(array)!
        XCTAssertNotNil(coercedArray)
        XCTAssertEqual(coercedArray.count, 3)
        XCTAssertTrue(type(of: coercedArray[1]) == NSNull.self)
        let filteredArray = coercedArray.capacitor.replacingNullValues()
        XCTAssertEqual(filteredArray.count, 3)
        XCTAssertNil(filteredArray[1])
        let restoredArray = filteredArray.capacitor.replacingOptionalValues()
        XCTAssertEqual(restoredArray.count, 3)
        XCTAssertNotNil(restoredArray[1])
        XCTAssertTrue(restoredArray[0] is NSNumber)
        XCTAssertTrue(restoredArray[1] is NSNull)
        XCTAssertTrue(restoredArray[2] is String)
    }
    
    func testSparseArrayCastSuccess() throws {
        let array: [Any] = ["test string 1", "test string 2", NSNull()]
        let sparseArray = JSTypes.coerceArrayToJSArray(array)?.capacitor.replacingNullValues() as? [String?]
        XCTAssertNotNil(sparseArray)
        XCTAssertEqual(sparseArray!.count, 3)
        XCTAssertNil(sparseArray![2])
    }
    
    func testSparseArrayCastFailure() throws {
        let array: [Any] = ["test string 1", 1, NSNull()]
        let sparseArray = JSTypes.coerceArrayToJSArray(array)?.capacitor.replacingNullValues() as? [String?]
        XCTAssertNil(sparseArray)
    }
}
