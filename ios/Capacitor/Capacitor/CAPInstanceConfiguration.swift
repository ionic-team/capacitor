import Foundation

extension InstanceConfiguration {
    @objc public func getPluginConfigValue(_ pluginId: String, _ configKey: String) -> Any? {
        return (pluginConfigurations as? JSObject)?[keyPath: KeyPath("\(pluginId).\(configKey)")]
    }

    @available(*, deprecated, message: "Use direct property accessors")
    @objc public func getValue(_ key: String) -> Any? {
        return (legacyConfig as? JSObject)?[keyPath: KeyPath(key)]
    }

    @available(*, deprecated, message: "Use direct property accessors")
    @objc public func getString(_ key: String) -> String? {
        return (legacyConfig as? JSObject)?[keyPath: KeyPath(key)] as? String
    }
}
