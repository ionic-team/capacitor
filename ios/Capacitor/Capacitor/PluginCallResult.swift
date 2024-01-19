import Foundation

public typealias PluginCallResultData = [String: Any]

public enum PluginCallResult {
    case dictionary(PluginCallResultData)

    enum SerializationError: Error {
        case invalidObject
    }

    func jsonRepresentation(includingFields: PluginCallResultData? = nil) throws -> String? {
        switch self {
        case .dictionary(var dictionary):
            if let fields = includingFields {
                dictionary.merge(fields) { (current, _) in current }
            }
            dictionary = prepare(dictionary: dictionary)
            guard JSONSerialization.isValidJSONObject(dictionary) else {
                throw SerializationError.invalidObject
            }
            let data = try JSONSerialization.data(withJSONObject: dictionary, options: [])
            return String(data: data, encoding: .utf8)
        }
    }

    private static let formatter = ISO8601DateFormatter()

    private func prepare(dictionary: PluginCallResultData) -> PluginCallResultData {
        return dictionary.mapValues { (value) -> Any in
            if let date = value as? Date {
                return PluginCallResult.formatter.string(from: date)
            } else if let aDictionary = value as? PluginCallResultData {
                return prepare(dictionary: aDictionary)
            } else if let anArray = value as? [Any] {
                return prepare(array: anArray)
            }
            return value
        }
    }

    private func prepare(array: [Any]) -> [Any] {
        return array.map { (value) -> Any in
            if let date = value as? Date {
                return PluginCallResult.formatter.string(from: date)
            } else if let aDictionary = value as? PluginCallResultData {
                return prepare(dictionary: aDictionary)
            } else if let anArray = value as? [Any] {
                return prepare(array: anArray)
            }
            return value
        }
    }
}

@objc public class CAPPluginCallResult: NSObject {
    public let resultData: PluginCallResult?

    @objc public var data: PluginCallResultData? {
        guard let result = resultData else {
            return nil
        }
        switch result {
        case .dictionary(let data):
            return data
        }
    }

    @objc(init:)
    public init(_ data: PluginCallResultData?) {
        if let data = data {
            resultData = .dictionary(data)
        } else {
            resultData = nil
        }
    }
}

@objc public class CAPPluginCallError: NSObject {
    @objc public let message: String
    @objc public let code: String?
    @objc public let error: Error?
    public let resultData: PluginCallResult?

    @objc public var data: PluginCallResultData? {
        guard let result = resultData else {
            return nil
        }
        switch result {
        case .dictionary(let data):
            return data
        }
    }

    @objc(init:code:error:data:)
    public init(message: String, code: String?, error: Error?, data: PluginCallResultData?) {
        self.message = message
        self.code = code
        self.error = error
        if let data = data {
            resultData = .dictionary(["data": data])
        } else {
            resultData = nil
        }
    }
}
