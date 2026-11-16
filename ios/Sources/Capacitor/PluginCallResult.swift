import Foundation

public enum PluginCallResult {
    case dictionary(PluginCallResultData)
}

public extension CAPPluginCallResult {
    var resultData: PluginCallResult? {
        return data.map { .dictionary($0) }
    }
}

public extension CAPPluginCallError {
    var resultData: PluginCallResult? {
        return data.map { .dictionary($0) }
    }
}
