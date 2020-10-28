public typealias PluginCallErrorData = [String: Any]
public typealias PluginResultData = [String: Any]
public typealias PluginEventListener = CAPPluginCall

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
    func hasOption(_ key: String) -> Bool {
        return self.options.index(forKey: key) != nil
    }

    @available(*, deprecated, renamed: "resolve()")
    func success() {
        successHandler(CAPPluginCallResult([:]), self)
    }

    @available(*, deprecated, renamed: "resolve")
    func success(_ data: PluginResultData = [:]) {
        successHandler(CAPPluginCallResult(data), self)
    }

    func resolve() {
        successHandler(CAPPluginCallResult(), self)
    }

    func resolve(_ data: PluginResultData = [:]) {
        successHandler(CAPPluginCallResult(data), self)
    }

    @available(*, deprecated, renamed: "reject")
    func error(_ message: String, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
        errorHandler(CAPPluginCallError(message: message, code: nil, error: error, data: data))
    }

    func reject(_ message: String, _ code: String? = nil, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
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
