import Foundation

@objc public class PluginConfig: NSObject {

    // The object containing the plugin config values
    private var config: JSObject

    init(config: JSObject) {
        self.config = config
    }

    public func getString(configKey: String, defaultValue: String? = nil) -> String? {
        if let val = (self.config)[keyPath: KeyPath(configKey)] as? String {
            return val
        }
        return defaultValue
    }

    public func getBoolean(configKey: String, defaultValue: Bool) -> Bool {
        if let val = (self.config)[keyPath: KeyPath(configKey)] as? Bool {
            return val
        }
        return defaultValue
    }

    public func getInt(configKey: String, defaultValue: Int) -> Int {
        if let val = (self.config)[keyPath: KeyPath(configKey)] as? Int {
            return val
        }
        return defaultValue
    }

    public func getArray(configKey: String, defaultValue: JSArray? = nil) -> JSArray? {
        if let val = (self.config)[keyPath: KeyPath(configKey)] as? JSArray {
            return val
        }
        return defaultValue
    }

    public func getObject(configKey: String) -> JSObject? {
        return (self.config)[keyPath: KeyPath(configKey)] as? JSObject
    }

    public func isEmpty() -> Bool {
        return self.config.isEmpty
    }

    /**
     * Gets the JSObject containing the config of the the provided plugin ID.
     *
     * @return The config for that plugin
     */
    public func getConfigJSON() -> JSObject {
        return self.config
    }
}
