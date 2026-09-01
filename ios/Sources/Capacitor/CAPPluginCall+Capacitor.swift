import Foundation

// MARK: - Accessors

public extension CAPPluginCall {
    func getString(_ key: String) -> String? {
        options[key] as? String
    }

    @objc func getString(_ key: String, defaultValue: String? = nil) -> String? {
        getString(key) ?? defaultValue
    }

    @objc func getNumber(_ key: String, defaultValue: NSNumber? = nil) -> NSNumber? {
        if let number = options[key] as? NSNumber {
            return number
        }
        if let int = options[key] as? Int {
            return NSNumber(value: int)
        }
        if let double = options[key] as? Double {
            return NSNumber(value: double)
        }
        return defaultValue
    }

    @objc func getBool(_ key: String, defaultValue: Bool) -> Bool {
        guard let number = getNumber(key) else { return defaultValue }
        return number.boolValue
    }

    @objc func getObject(_ key: String) -> [String: Any]? {
        options[key] as? [String: Any]
    }

    @objc func getArray(_ key: String) -> [Any]? {
        options[key] as? [Any]
    }

    func getDate(_ key: String) -> Date? {
        guard let value = options[key] else {
            return nil
        }

        if let date = value as? Date {
            return date
        }

        if let dateString = value as? String {
            return Self.jsDateFormatter.date(from: dateString)
        }

        return nil
    }

    @objc func getDate(_ key: String, defaultValue: Date? = nil) -> Date? {
        getDate(key) ?? defaultValue
    }
}

// MARK: - JSValue Representation

extension CAPPluginCall: JSValueContainer {
    public var jsObjectRepresentation: JSObject {
        options as? JSObject ?? [:]
    }
}

@objc extension CAPPluginCall: BridgedJSValueContainer {
    public var dictionaryRepresentation: NSDictionary {
        options as NSDictionary
    }

    public static var jsDateFormatter = ISO8601DateFormatter()
}

// MARK: - Result Handling

@objc public extension CAPPluginCall {
    func resolve() {
        successHandler(CAPPluginCallResult(nil), self)
    }

    func resolve(_ data: PluginCallResultData = [:]) {
        successHandler(CAPPluginCallResult(data), self)
    }

    func reject(_ message: String, _ code: String? = nil, _ error: Error? = nil, _ data: PluginCallResultData? = nil) {
        errorHandler(CAPPluginCallError(message: message, code: code, error: error as NSError?, data: data))
    }

    func unimplemented() {
        unimplemented("not implemented")
    }

    func unimplemented(_ message: String) {
        errorHandler(CAPPluginCallError(message: message, code: "UNIMPLEMENTED", error: nil, data: [:]))
    }

    func unavailable() {
        unavailable("not available")
    }

    func unavailable(_ message: String) {
        errorHandler(CAPPluginCallError(message: message, code: "UNAVAILABLE", error: nil, data: [:]))
    }
}

// MARK: - Codable Support

public extension CAPPluginCall {
    func resolve<T: Encodable>(
        with data: T,
        encoder: JSValueEncoder = JSValueEncoder(),
        messageForRejectionFromError: (Error) -> String = { _ in "Failed encoding response" }
    ) {
        do {
            let encoded = try encoder.encodeJSObject(data)
            resolve(encoded)
        } catch {
            let message = messageForRejectionFromError(error)
            reject(message, nil, error)
        }
    }

    func decode<T: Decodable>(_ type: T.Type, decoder: JSValueDecoder = JSValueDecoder()) throws -> T {
        try decoder.decode(type, from: options as? JSObject ?? [:])
    }
}
