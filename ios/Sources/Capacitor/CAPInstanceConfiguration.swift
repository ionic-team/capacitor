//
//  CAPInstanceConfiguration.swift
//  Capacitor
//
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import Foundation

// MARK: - Computed Properties

extension InstanceConfiguration {
    @objc public var appStartFileURL: URL {
        if let path = appStartPath {
            return appLocation.appendingPathComponent(path)
        }
        return appLocation
    }

    @objc public var appStartServerURL: URL {
        if let path = appStartPath {
            return serverURL.appendingPathComponent(path)
        }
        return serverURL
    }

    @objc public var errorPathURL: URL? {
        guard let errorPath = errorPath else {
            return nil
        }
        return localURL.appendingPathComponent(errorPath)
    }
}

// MARK: - Plugin Configuration

extension InstanceConfiguration {
    @objc public func getPluginConfig(_ pluginId: String) -> PluginConfig {
        if let cfg = (pluginConfigurations as? JSObject)?[keyPath: KeyPath("\(pluginId)")] as? JSObject {
            return PluginConfig(config: cfg)
        }
        return PluginConfig(config: JSObject())
    }
}

// MARK: - Navigation

extension InstanceConfiguration {
    @objc public func shouldAllowNavigation(to host: String) -> Bool {
        for hostname in allowedNavigationHostnames {
            if doesHost(host, match: hostname) {
                return true
            }
        }
        return false
    }

    private func doesHost(_ host: String, match pattern: String) -> Bool {
        if pattern == "*" {
            return true
        }
        var hostComponents = host.lowercased().split(separator: ".")
        var patternComponents = pattern.lowercased().split(separator: ".")
        guard hostComponents.count == patternComponents.count else {
            return false
        }
        for wildcard in patternComponents.enumerated().reversed().filter({ $0.element == "*" }) {
            hostComponents.remove(at: wildcard.offset)
            patternComponents.remove(at: wildcard.offset)
        }
        return hostComponents == patternComponents
    }
}
