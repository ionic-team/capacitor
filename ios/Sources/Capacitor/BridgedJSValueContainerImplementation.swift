//
//  BridgedJSValueContainerImplementation.swift
//  Capacitor
//
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import Foundation

/// Protocol for accessing JavaScript values with type safety.
/// Provides convenience accessors for extracting and converting JavaScript types.
@objc public protocol BridgedJSValueContainerImplementation: NSObjectProtocol {
    /// Extract a string value from the container
    /// - Parameters:
    ///   - key: The key to retrieve
    ///   - defaultValue: Value to return if key is missing or not a string
    /// - Returns: The string value or defaultValue
    @objc func getString(_ key: String, defaultValue: String?) -> String?

    /// Extract a date value from the container, with ISO8601 string parsing
    /// - Parameters:
    ///   - key: The key to retrieve
    ///   - defaultValue: Value to return if key is missing or not a date
    /// - Returns: The date value or defaultValue
    @objc func getDate(_ key: String, defaultValue: Date?) -> Date?

    /// Extract a dictionary (object) value from the container
    /// - Parameters:
    ///   - key: The key to retrieve
    ///   - defaultValue: Value to return if key is missing or not a dictionary
    /// - Returns: The dictionary value or defaultValue
    @objc func getObject(_ key: String, defaultValue: [String: Any]?) -> [String: Any]?

    /// Extract an array value from the container
    /// - Parameters:
    ///   - key: The key to retrieve
    ///   - defaultValue: Value to return if key is missing or not an array
    /// - Returns: The array value or defaultValue
    @objc func getArray(_ key: String, defaultValue: [Any]?) -> [Any]?

    /// Extract a number value from the container
    /// - Parameters:
    ///   - key: The key to retrieve
    ///   - defaultValue: Value to return if key is missing or not a number
    /// - Returns: The number value or defaultValue
    @objc func getNumber(_ key: String, defaultValue: NSNumber?) -> NSNumber?

    /// Extract a boolean value from the container
    /// - Parameters:
    ///   - key: The key to retrieve
    ///   - defaultValue: Value to return if key is missing or not a number
    /// - Returns: The boolean value or defaultValue
    @objc func getBool(_ key: String, defaultValue: Bool) -> Bool
}
