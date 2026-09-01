import Foundation

/// Serializes a plugin call's result dictionary to the JSON string sent back across the bridge,
/// converting `Date` values to ISO8601 strings (recursively through nested dictionaries/arrays).
///
/// Ported from the former `PluginCallResult` enum once the result/error carriers moved to the
/// Objective-C `CapacitorObjC` target, which stores their payloads as plain dictionaries.
enum JSResultSerialization {
    enum SerializationError: Error {
        case invalidObject
    }

    private static let formatter = ISO8601DateFormatter()

    static func jsonRepresentation(of dictionary: PluginCallResultData, includingFields: PluginCallResultData? = nil) throws -> String? {
        var dictionary = dictionary
        if let fields = includingFields {
            dictionary.merge(fields) { (current, _) in current }
        }
        let prepared = prepare(dictionary: dictionary)
        guard JSONSerialization.isValidJSONObject(prepared) else {
            throw SerializationError.invalidObject
        }
        let data = try JSONSerialization.data(withJSONObject: prepared, options: [])
        return String(data: data, encoding: .utf8)
    }

    private static func prepare(dictionary: PluginCallResultData) -> PluginCallResultData {
        return dictionary.mapValues { (value) -> Any in
            if let date = value as? Date {
                return formatter.string(from: date)
            } else if let aDictionary = value as? PluginCallResultData {
                return prepare(dictionary: aDictionary)
            } else if let anArray = value as? [Any] {
                return prepare(array: anArray)
            }
            return value
        }
    }

    private static func prepare(array: [Any]) -> [Any] {
        return array.map { (value) -> Any in
            if let date = value as? Date {
                return formatter.string(from: date)
            } else if let aDictionary = value as? PluginCallResultData {
                return prepare(dictionary: aDictionary)
            } else if let anArray = value as? [Any] {
                return prepare(array: anArray)
            }
            return value
        }
    }
}
