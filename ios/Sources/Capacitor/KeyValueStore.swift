//
//  KeyValueStore.swift
//  Capacitor
//
//  Created by Steven Sherry on 1/5/24.
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import Foundation

/// A generic KeyValueStore that allows storing and retrieving values associated with string keys.
/// The store supports both ephemeral (in-memory) storage and persistent (file-based) storage backends
/// by default, however it can also take anything that conforms to ``KeyValueStoreBackend`` as
/// a backend.
///
/// This class provides methods to get, set and delete key-value pairs for any type of value, provided the
/// types conform to `Codable`. The default ``Backend/ephemeral`` and ``Backend/persistent(suiteName:)``
/// backends are thread-safe.
///
/// ## Usage Examples
///
/// ### Non-throwing API
/// ```swift
/// let store = KeyValueStore.standard
/// // Set
/// store["key"] = "value"
///
/// // Get
/// if let value = store["key", as: String.self] {
///   // Do something with value
/// }
///
/// // Delete
/// // The type here is a required argument because
/// // it is unable to be inferred
/// store["key", as: String.self] = nil
/// // or
/// store["key"] = nil as String?
/// ```
///
///
/// ### Throwing API
///
/// ```swift
/// let store = KeyValueStore.standard
/// do {
///     // Set
///     try store.set("key", value: "value")
///
///     // Get
///     if let value = try store.get("key", as: String.self) {
///         // Do something with value
///     }
///
///     // Delete
///     try store.delete("key")
/// } catch {
///     print(error.localizedDescription)
/// }
/// ```
///
/// ### Throwing vs Non-throwing
///
/// Of the built-in backends, both ``Backend/ephemeral`` and ``Backend/persistent(suiteName:)`` will throw in the following cases:
/// * The data read from the file retrieved during ``get(_:as:)`` is unable to be decoded as the type provided.
/// * The value provided to ``set(_:value:)`` encounters an error during encoding.
///     * This is more likely to happen with types that have custom `Encodable` implementations
///
/// ``Backend/persistent(suiteName:)`` will throw for the following additional cases:
/// * A file is unable to be read from disk during ``get(_:as:)``
///     * The existence of the file on disk is checked before attempting to read the file, so out of the
///       [possible file reading errors](https://developer.apple.com/documentation/foundation/1448136-nserror_codes#file-reading-errors),
///       the only likely candidate would be
///       [NSFileReadCorruptFileError](https://developer.apple.com/documentation/foundation/1448136-nserror_codes/nsfilereadcorruptfileerror).
///       In practice, this should never happen since writes happen atomically.
/// * The data from the value encoded in ``set(_:value:)`` is unable to be written to disk
///     * Of the [possible file writing errors](https://developer.apple.com/documentation/foundation/1448136-nserror_codes#file-writing-errors),
///       the only likely candidates are
///       [NSFileWriteInvalidFileNameError](https://developer.apple.com/documentation/foundation/1448136-nserror_codes/nsfilewriteinvalidfilenameerror)
///       if the key provided makes for an invalid file name and
///       [NSFileWriteOutOfSpaceError](https://developer.apple.com/documentation/foundation/1448136-nserror_codes/nsfilewriteoutofspaceerror)
///       if the user has no space left on disk
///
/// The throwing API should be used in cases where detailed error information is needed for logging or diagnostics. The non-throwing API should be used
/// in cases where silent failure is preferred.
public class KeyValueStore {

    /// The built-in storage backends
    public enum Backend {
        /// An in-memory backing store
        case ephemeral
        /// A persistent file-based backing store using the
        /// `suiteName` as an identifier for the collection of files
        case persistent(suiteName: String)
    }

    private let backend: any KeyValueStoreBackend

    /// Creates an instance of ``KeyValueStore`` with a custom backend
    /// - Parameter backend: The custom backend implementation
    public init(backend: any KeyValueStoreBackend) {
        self.backend = backend
    }

    /// Creates an instance of ``KeyValueStore`` with the provided built-in ``Backend``
    /// - Parameter type: The type of ``Backend`` to use
    public init(type: Backend) {
        switch type {
        case .ephemeral:
            backend = InMemoryStore()
        case .persistent(suiteName: let name):
            backend = FileStore.with(name: name)
        }
    }

    /// Creates an instance of ``KeyValueStore`` with ``Backend/persistent(suiteName:)``
    /// - Parameter suiteName: The suite name to provide ``Backend/persistent(suiteName:)``
    public convenience init(suiteName: String) {
        self.init(type: .persistent(suiteName: suiteName))
    }

    /// Retrieves a value of the specified type and key
    /// - Parameters:
    ///   - key: The unique identifier for the value
    ///   - type: The expected type of the value being retried
    /// - Returns: A decoded value of the given type or `nil` if there is no such value
    public func `get`<T>(_ key: String, as type: T.Type = T.self) throws -> T? where T: Decodable {
        try backend.get(key, as: type)
    }

    /// Stores the value under the specified key
    /// - Parameters:
    ///   - key: The unique identifier
    ///   - value: The value to be stored
    public func `set`<T>(_ key: String, value: T) throws where T: Encodable {
        try backend.set(key, value: value)
    }

    /// Deletes the value for the specified key
    public func `delete`(_ key: String) throws {
        try backend.delete(key)
    }

    /// Convenience for accessing and modifying values in the store without calling ``get(_:as:)``, ``set(_:value:)``, or ``delete(_:)``
    /// - Parameters:
    ///     - key: The unique identifier for the value to access or modify
    ///     - type: The type the value is stored as
    ///
    /// This method is only really necessary when accessing a key and the type cannot be inferred from it's context.
    /// ```swift
    /// let store = KeyValueStore.standard
    ///
    /// // Get
    /// let value = store["key", as: String.self]
    ///
    /// // If the type can be inferred then it may be omitted
    /// let value: String? = store["key"]
    /// let value = store["key"] as String?
    /// let value = store["key"] ?? "default"
    ///
    /// // Delete
    /// store["key", as: String.self] = nil
    /// store["key"] = nil as String?
    /// ```
    public subscript<T> (_ key: String, as type: T.Type = T.self) -> T? where T: Codable {
        get { try? self.get(key) }
        set {
            if let newValue {
                try? self.set(key, value: newValue)
            } else {
                try? self.delete(key)
            }
        }
    }

    /// A shared persistent instance of ``KeyValueStore``
    public static let standard = KeyValueStore(type: .persistent(suiteName: "standard"))
}

public protocol KeyValueStoreBackend {
    func `get`<T>(_ key: String, as type: T.Type) throws -> T? where T: Decodable
    func `set`<T>(_ key: String, value: T) throws where T: Encodable
    func `delete`(_ key: String) throws
}

private class FileStore: KeyValueStoreBackend {
    private let cache = ConcurrentDictionary<Data>()
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()
    private let baseUrl: URL

    private init(baseUrl: URL) {
        self.baseUrl = baseUrl
    }

    func get<T>(_ key: String, as type: T.Type) throws -> T? where T: Decodable {
        if let cached = cache[key],
           let value = try? decoder.decode(type, from: cached) {
            return value
        }

        let fileCacheLocation = baseUrl.appendingPathComponent(key)
        guard FileManager.default.fileExists(atPath: fileCacheLocation.path) else { return nil }

        let data = try Data(contentsOf: fileCacheLocation)
        let decoded = try decoder.decode(type, from: data)

        cache[key] = data
        return decoded
    }

    func set<T>(_ key: String, value: T) throws where T: Encodable {
        let encoded = try encoder.encode(value)
        try encoded.write(to: url(for: key), options: .atomic)
        cache[key] = encoded
    }

    func delete(_ key: String) throws {
        cache[key] = nil
        try FileManager.default.removeItem(at: url(for: key))
    }

    private func url(for key: String) -> URL {
        baseUrl.appendingPathComponent(key)
    }

    private static let instances = ConcurrentDictionary<FileStore>()

    // This ensures we essentially have singletons for accessing file based resources
    // so we don't have a scenario where two separate instances may be writing to
    // the same files.
    static func with(name: String) -> FileStore {
        if let existing = instances[name] { return existing }
        guard let library = try? FileManager
                .default
                .url(
                    for: .libraryDirectory,
                    in: .userDomainMask,
                    appropriateFor: nil,
                    create: true
                )
        else { fatalError("⚡️ ❌ Library URL unable to be accessed or created by the current application. This is an impossible state.") }

        let url = library.appendingPathComponent("kvstore").appendingPathComponent(name)

        // Create the folder if it doesn't exist. This should never throw for the current base directory, so we ignore the exception.
        try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true, attributes: nil)

        let new = FileStore(baseUrl: url)
        instances[name] = new
        return new
    }
}

private class InMemoryStore: KeyValueStoreBackend {
    private let storage = ConcurrentDictionary<Data>()
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    func get<T>(_ key: String, as type: T.Type) throws -> T? where T: Decodable {
        guard let data = storage[key] else { return nil }
        return try decoder.decode(type, from: data)
    }

    func set<T>(_ key: String, value: T) throws where T: Encodable {
        let data = try encoder.encode(value)
        storage[key] = data
    }

    func delete(_ key: String) {
        storage[key] = nil
    }
}

class ConcurrentDictionary<Value> {
    typealias StorageType = [String: Value]
    private var storage: StorageType
    private let lock = NSLock()

    init(_ initial: StorageType = [:]) {
        storage = initial
    }

    subscript (_ key: String) -> Value? {
        get {
            lock.withLock {
                storage[key]
            }
        }

        set {
            lock.withLock {
                storage[key] = newValue
            }
        }
    }

    func withLock<T>(_ body: (_ storage: inout StorageType) -> T) -> T {
        lock.withLock {
            body(&storage)
        }
    }
}
