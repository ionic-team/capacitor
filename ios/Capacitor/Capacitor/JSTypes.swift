import Foundation

// declare our empty protocol, and conformance, for typing
public protocol JSValue {}
extension String: JSValue {}
extension Bool: JSValue {}
extension Int: JSValue {}
extension Float: JSValue {}
extension Double: JSValue {}
extension NSNumber: JSValue {}
extension Array: JSValue {}
extension Dictionary: JSValue where Key == String, Value == JSValue {}

// convenience aliases
public typealias JSObject = [String: JSValue]
public typealias JSArray = [JSValue]

// string types
public protocol JSStringContainer {
    func getString(_ key: String, _ defaultValue: String) -> String
    func getString(_ key: String) -> String?
}

extension JSStringContainer {
    public func getString(_ key: String, _ defaultValue: String) -> String {
        return getString(key) ?? defaultValue
    }
}

// boolean types
public protocol JSBoolContainer {
    func getBool(_ key: String, _ defaultValue: Bool) -> Bool
    func getBool(_ key: String) -> Bool?
}

extension JSBoolContainer {
    public func getBool(_ key: String, _ defaultValue: Bool) -> Bool {
        return getBool(key) ?? defaultValue
    }
}

// integer types
public protocol JSIntContainer {
    func getInt(_ key: String, _ defaultValue: Int) -> Int
    func getInt(_ key: String) -> Int?
}

extension JSIntContainer {
    public func getInt(_ key: String, _ defaultValue: Int) -> Int {
        return getInt(key) ?? defaultValue
    }
}

// float types
public protocol JSFloatContainer {
    func getFloat(_ key: String, _ defaultValue: Float) -> Float
    func getFloat(_ key: String) -> Float?
}

extension JSFloatContainer {
    public func getFloat(_ key: String, _ defaultValue: Float) -> Float {
        return getFloat(key) ?? defaultValue
    }
}

// double types
public protocol JSDoubleContainer {
    func getDouble(_ key: String, _ defaultValue: Double) -> Double
    func getDouble(_ key: String) -> Double?
}

extension JSDoubleContainer {
    public func getDouble(_ key: String, _ defaultValue: Double) -> Double {
        return getDouble(key) ?? defaultValue
    }
}

// date types
public protocol JSDateContainer {
    func getDate(_ key: String, _ defaultValue: Date) -> Date
    func getDate(_ key: String) -> Date?
}

extension JSDateContainer {
    public func getDate(_ key: String, _ defaultValue: Date) -> Date {
        return getDate(key) ?? defaultValue
    }
}

// array types
public protocol JSArrayContainer {
    func getArray(_ key: String, _ defaultValue: JSArray) -> JSArray
    func getArray<T>(_ key: String, _ ofType: T.Type) -> [T]?
    func getArray(_ key: String) -> JSArray?
}

extension JSArrayContainer {
    public func getArray(_ key: String, _ defaultValue: JSArray) -> JSArray {
        return getArray(key) ?? defaultValue
    }

    public func getArray<T>(_ key: String, _ ofType: T.Type) -> [T]? {
        return getArray(key) as? [T]
    }
}

// dictionary types
public protocol JSObjectContainer {
    func getObject(_ key: String, _ defaultValue: JSObject) -> JSObject
    func getObject(_ key: String) -> JSObject?
}

extension JSObjectContainer {
    public func getObject(_ key: String, _ defaultValue: JSObject) -> JSObject {
        return getObject(key) ?? defaultValue
    }
}

public protocol JSValueContainer: JSStringContainer, JSBoolContainer, JSIntContainer, JSFloatContainer, JSDoubleContainer, JSDateContainer, JSArrayContainer, JSObjectContainer {
    static var jsDateFormatter: ISO8601DateFormatter { get }
    var jsObjectRepresentation: JSObject { get }
}

extension JSValueContainer {
    public func getString(_ key: String) -> String? {
        return jsObjectRepresentation[key] as? String
    }

    public func getBool(_ key: String) -> Bool? {
        return jsObjectRepresentation[key] as? Bool
    }

    public func getInt(_ key: String) -> Int? {
        return jsObjectRepresentation[key] as? Int
    }

    public func getFloat(_ key: String) -> Float? {
        if let floatValue = jsObjectRepresentation[key] as? Float {
            return floatValue
        } else if let doubleValue = jsObjectRepresentation[key] as? Double {
            return Float(doubleValue)
        }
        return nil
    }

    public func getDouble(_ key: String) -> Double? {
        return jsObjectRepresentation[key] as? Double
    }

    public func getDate(_ key: String) -> Date? {
        if let isoString = jsObjectRepresentation[key] as? String {
            return Self.jsDateFormatter.date(from: isoString)
        }
        return nil
    }

    public func getArray(_ key: String) -> JSArray? {
        return jsObjectRepresentation[key] as? JSArray
    }

    public func getObject(_ key: String) -> JSObject? {
        return jsObjectRepresentation[key] as? JSObject
    }
}

@objc protocol BridgedJSValueContainer: NSObjectProtocol {
    static var jsDateFormatter: ISO8601DateFormatter { get }
    var dictionaryRepresentation: NSDictionary { get }
}
