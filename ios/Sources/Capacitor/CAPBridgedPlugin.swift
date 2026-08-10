//
//  CAPBridgedPlugin.swift
//  Capacitor
//
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import Foundation

/// Protocol for plugins that are bridged to JavaScript.
/// Plugins conforming to this protocol expose their structure and methods for registration with Capacitor.
@objc public protocol CAPBridgedPlugin: NSObjectProtocol {
    /// Unique identifier for the plugin within the bridge (typically the package name or plugin id)
    @objc var identifier: String { get }

    /// Name exposed to JavaScript (the plugin's JavaScript class name)
    @objc var jsName: String { get }

    /// Array of plugin methods available to JavaScript
    @objc var pluginMethods: [CAPPluginMethod] { get }
}
