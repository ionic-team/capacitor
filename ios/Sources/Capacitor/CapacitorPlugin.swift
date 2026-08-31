//
//  CapacitorPlugin.swift
//  Capacitor
//
//  Copyright © 2026 Drifty Co. All rights reserved.
//

import Foundation

/// A Swift-native Capacitor plugin.
///
/// Conforming plugins expose their methods as typed, `async throws` handlers instead of
/// relying on the Objective-C runtime (`@objc` + selector dispatch). The bridge dispatches
/// a call by looking up the method name in ``methodHandlers``; anything thrown by a handler
/// is turned into a rejection of the originating call.
///
/// Plugins still conform to ``CAPBridgedPlugin`` so that JavaScript export and plugin
/// discovery continue to work unchanged.
public protocol CapacitorPlugin: CAPBridgedPlugin {
    /// Map of JavaScript-facing method name to the handler that services the call.
    var methodHandlers: [String: (CAPPluginCall) async throws -> Void] { get }
}
