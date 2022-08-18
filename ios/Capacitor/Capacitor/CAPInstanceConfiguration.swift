import Foundation

extension InstanceConfiguration {
    @objc var appStartFileURL: URL {
        if let path = appStartPath {
            return appLocation.appendingPathComponent(path)
        }
        return appLocation
    }

    @objc var appStartServerURL: URL {
        if let path = appStartPath {
            return serverURL.appendingPathComponent(path)
        }
        return serverURL
    }

    @objc var errorPathURL: URL? {
        guard let errorPath = errorPath else {
            return nil
        }

        return localURL.appendingPathComponent(errorPath)
    }

    @available(*, deprecated, message: "Use getPluginConfig")
    @objc public func getPluginConfigValue(_ pluginId: String, _ configKey: String) -> Any? {
        return (pluginConfigurations as? JSObject)?[keyPath: KeyPath("\(pluginId).\(configKey)")]
    }

    @objc public func getPluginConfig(_ pluginId: String) -> PluginConfig {
        if let cfg = (pluginConfigurations as? JSObject)?[keyPath: KeyPath("\(pluginId)")] as? JSObject {
            return PluginConfig(config: cfg)
        }
        return PluginConfig(config: JSObject())
    }

    @objc public func shouldAllowNavigation(to host: String) -> Bool {
        for hostname in allowedNavigationHostnames {
            if doesHost(host, match: hostname) {
                return true
            }
        }
        return false
    }

    @available(*, deprecated, message: "Use direct property accessors")
    @objc public func getValue(_ key: String) -> Any? {
        return (legacyConfig as? JSObject)?[keyPath: KeyPath(key)]
    }

    @available(*, deprecated, message: "Use direct property accessors")
    @objc public func getString(_ key: String) -> String? {
        return (legacyConfig as? JSObject)?[keyPath: KeyPath(key)] as? String
    }

    // MARK: - Private

    private func doesHost(_ host: String, match pattern: String) -> Bool {
        // bail early in the simple case
        if pattern == "*" {
            return true
        }
        // break apart the pieces
        var hostComponents = host.lowercased().split(separator: ".")
        var patternComponents = pattern.lowercased().split(separator: ".")
        guard hostComponents.count == patternComponents.count else {
            return false
        }
        // remove any wildcard segments
        for wildcard in patternComponents.enumerated().reversed().filter({ $0.element == "*" }) {
            hostComponents.remove(at: wildcard.offset)
            patternComponents.remove(at: wildcard.offset)
        }
        // match with what's left
        return hostComponents == patternComponents
    }
}
