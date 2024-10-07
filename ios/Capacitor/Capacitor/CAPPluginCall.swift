import Foundation

@available(*, deprecated, renamed: "PluginCallResultData")
public typealias PluginCallErrorData = [String: Any]
@available(*, deprecated, renamed: "PluginCallResultData")
public typealias PluginResultData = [String: Any]

/**
 * Swift niceties for CAPPluginCall
 */

extension CAPPluginCall: JSValueContainer {
    public var jsObjectRepresentation: JSObject {
        return options as? JSObject ?? [:]
    }
}

@objc extension CAPPluginCall: BridgedJSValueContainer {
    public var dictionaryRepresentation: NSDictionary {
        return options as NSDictionary
    }

    public static var jsDateFormatter: ISO8601DateFormatter = {
        return ISO8601DateFormatter()
    }()
}

@objc public extension CAPPluginCall {
    @available(*, deprecated, message: "Presence of a key should not be considered significant. Use typed accessors to check the value instead.")
    func hasOption(_ key: String) -> Bool {
        guard let value = options[key] else {
            return false
        }
        return !(value is NSNull)
    }

    func resolve() {
        successHandler(CAPPluginCallResult(nil), self)
    }

    func resolve(_ data: PluginCallResultData = [:]) {
        successHandler(CAPPluginCallResult(data), self)
    }

    func reject(_ message: String, _ code: String? = nil, _ error: Error? = nil, _ data: PluginCallResultData? = nil) {
        errorHandler(CAPPluginCallError(message: message, code: code, error: error, data: data))
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

// MARK: Codable Support
public extension CAPPluginCall {
    /// Encodes the given value to a ``JSObject`` and resolves the call. If an error is thrown during encoding, ``reject(_:_:_:_:)`` is called.
    /// - Parameters:
    ///   - data: The value to encode
    ///   - encoder: The encoder to use. Defaults to `JSValueEncoder()`
    ///   - messageForRejectionFromError: A closure that takes the error thrown from ``JSValueEncoder/encodeJSObject(_:)``
    ///   and returns a string to be provided to ``reject(_:_:_:_:)``. Defaults to a function that returns "Failed encoding response".
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

    /// Decodes the options to the given type.
    /// - Parameters:
    ///   - type: The type to decode to.
    ///   - decoder: The decoder to use. Defaults to `JSValueDecoder()`.
    /// - Throws: If the options cannot be decoded.
    /// - Returns: The decoded value.
    func decode<T: Decodable>(_ type: T.Type, decoder: JSValueDecoder = JSValueDecoder()) throws -> T {
        try decoder.decode(type, from: options as? JSObject ?? [:])
    }
}
