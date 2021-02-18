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

    @available(*, deprecated, renamed: "resolve()")
    func success() {
        successHandler(CAPPluginCallResult([:]), self)
    }

    @available(*, deprecated, renamed: "resolve")
    func success(_ data: PluginCallResultData = [:]) {
        successHandler(CAPPluginCallResult(data), self)
    }

    func resolve() {
        successHandler(CAPPluginCallResult(nil), self)
    }

    func resolve(_ data: PluginCallResultData = [:]) {
        successHandler(CAPPluginCallResult(data), self)
    }

    @available(*, deprecated, renamed: "reject")
    func error(_ message: String, _ error: Error? = nil, _ data: PluginCallResultData = [:]) {
        errorHandler(CAPPluginCallError(message: message, code: nil, error: error, data: data))
    }

    func reject(_ message: String, _ code: String? = nil, _ error: Error? = nil, _ data: PluginCallResultData = [:]) {
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
