//
//  Macros.swift
//  Capacitor
//
//  Copyright © 2026 Drifty Co. All rights reserved.
//

import Foundation

/// Declares a Swift-native Capacitor plugin.
///
/// Apply to a `CAPPlugin` subclass to synthesize the `CapacitorPlugin`/`CAPBridgedPlugin`
/// requirements (`identifier`, `jsName`, `pluginMethods`, `methodHandlers`) from the methods
/// annotated with ``PluginMethod(returnType:)``.
///
/// ```swift
/// @objc(MyPlugin)
/// @Plugin(jsName: "My")
/// public class MyPlugin: CAPPlugin {
///     @PluginMethod func echo(_ call: CAPPluginCall) { call.resolve() }
/// }
/// ```
///
/// - Parameters:
///   - jsName: The name exposed to JavaScript.
///   - identifier: The native identifier used for registration and discovery. Defaults to the
///     class name.
@attached(member, names: named(identifier), named(jsName), named(pluginMethods), named(methodHandlers))
@attached(extension, conformances: CapacitorPlugin)
public macro Plugin(jsName: String, identifier: String? = nil) = #externalMacro(module: "CapacitorMacrosImpl", type: "PluginMacro")

/// Marks a method as a Capacitor plugin method exposed to JavaScript.
///
/// - Parameter returnType: How the method reports back to JavaScript. Defaults to `.promise`.
@attached(peer)
public macro PluginMethod(returnType: CAPPluginMethod.ReturnType = .promise) = #externalMacro(module: "CapacitorMacrosImpl", type: "PluginMethodMacro")
