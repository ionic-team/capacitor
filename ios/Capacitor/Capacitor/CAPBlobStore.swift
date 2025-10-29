import Foundation

/// Manages temporary blob storage for efficient binary data transfer between native and JavaScript
@objc public class CAPBlobStore: NSObject {

    // MARK: - Blob Entry

    private struct BlobEntry {
        let data: Data
        let mimeType: String
        let createdAt: Date
        var accessCount: Int
    }

    // MARK: - Properties

    private var storage: [String: BlobEntry] = [:]
    private let queue = DispatchQueue(label: "com.capacitorjs.blobstore", attributes: .concurrent)
    private var cleanupTimer: Timer?

    /// Singleton instance
    @objc public static let shared = CAPBlobStore()

    /// Maximum time a blob can exist (default: 5 minutes)
    @objc public var maxBlobLifetime: TimeInterval = 300

    /// Maximum storage size in bytes (default: 50MB)
    @objc public var maxStorageSize: Int = 50 * 1024 * 1024

    private var currentStorageSize: Int = 0

    // MARK: - Initialization

    private override init() {
        super.init()
        startCleanupTimer()
    }

    deinit {
        cleanupTimer?.invalidate()
    }

    // MARK: - Public API

    /// Store binary data and return a blob URL
    /// - Parameters:
    ///   - data: The binary data to store
    ///   - mimeType: MIME type of the data (e.g., "image/png")
    /// - Returns: A blob URL string that can be used to retrieve the data
    @objc public func store(data: Data, mimeType: String = "application/octet-stream") -> String? {
        // Check size limits
        guard data.count + currentStorageSize <= maxStorageSize else {
            CAPLog.print("⚠️  BlobStore: Storage limit exceeded")
            return nil
        }

        let blobId = UUID().uuidString
        let blobUrl = "blob:capacitor://\(blobId)"

        queue.async(flags: .barrier) { [weak self] in
            guard let self = self else { return }

            let entry = BlobEntry(
                data: data,
                mimeType: mimeType,
                createdAt: Date(),
                accessCount: 0
            )

            self.storage[blobId] = entry
            self.currentStorageSize += data.count

            CAPLog.print("📦 BlobStore: Stored \(data.count) bytes as \(blobUrl)")
        }

        return blobUrl
    }

    /// Retrieve data for a blob URL
    /// - Parameter blobUrl: The blob URL (format: "blob:capacitor://<uuid>")
    /// - Returns: Tuple of (data, mimeType) if found, nil otherwise
    @objc public func retrieve(blobUrl: String) -> (data: Data, mimeType: String)? {
        guard let blobId = extractBlobId(from: blobUrl) else {
            return nil
        }

        var result: (Data, String)?

        queue.sync {
            if let entry = storage[blobId] {
                result = (entry.data, entry.mimeType)
            }
        }

        // Increment access count
        if result != nil {
            queue.async(flags: .barrier) { [weak self] in
                self?.storage[blobId]?.accessCount += 1
            }
        }

        return result
    }

    /// Remove a specific blob from storage
    /// - Parameter blobUrl: The blob URL to remove
    @objc public func remove(blobUrl: String) {
        guard let blobId = extractBlobId(from: blobUrl) else {
            return
        }

        queue.async(flags: .barrier) { [weak self] in
            guard let self = self else { return }

            if let entry = self.storage.removeValue(forKey: blobId) {
                self.currentStorageSize -= entry.data.count
                CAPLog.print("🗑️  BlobStore: Removed blob \(blobId)")
            }
        }
    }

    /// Clear all stored blobs
    @objc public func clearAll() {
        queue.async(flags: .barrier) { [weak self] in
            guard let self = self else { return }

            let count = self.storage.count
            self.storage.removeAll()
            self.currentStorageSize = 0

            CAPLog.print("🗑️  BlobStore: Cleared all \(count) blobs")
        }
    }

    // MARK: - Private Methods

    private func extractBlobId(from blobUrl: String) -> String? {
        guard blobUrl.starts(with: "blob:capacitor://") else {
            return nil
        }
        return String(blobUrl.dropFirst("blob:capacitor://".count))
    }

    private func startCleanupTimer() {
        cleanupTimer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { [weak self] _ in
            self?.cleanupExpiredBlobs()
        }
    }

    private func cleanupExpiredBlobs() {
        queue.async(flags: .barrier) { [weak self] in
            guard let self = self else { return }

            let now = Date()
            var removedCount = 0
            var removedSize = 0

            for (blobId, entry) in self.storage {
                let age = now.timeIntervalSince(entry.createdAt)
                if age > self.maxBlobLifetime {
                    self.storage.removeValue(forKey: blobId)
                    removedCount += 1
                    removedSize += entry.data.count
                }
            }

            if removedCount > 0 {
                self.currentStorageSize -= removedSize
                CAPLog.print("🧹 BlobStore: Cleaned up \(removedCount) expired blobs (\(removedSize) bytes)")
            }
        }
    }

    // MARK: - Helpers for Plugin Integration

    /// Create a JSObject with a blob URL reference
    /// - Parameters:
    ///   - data: Binary data to store
    ///   - mimeType: MIME type of the data
    ///   - additionalFields: Optional additional fields to include in the result
    /// - Returns: Dictionary with blob URL and metadata
    @objc public func createBlobResponse(data: Data, mimeType: String, additionalFields: [String: Any]? = nil) -> [String: Any]? {
        guard let blobUrl = store(data: data, mimeType: mimeType) else {
            return nil
        }

        var result: [String: Any] = [
            "blob": blobUrl,
            "type": mimeType,
            "size": data.count
        ]

        if let fields = additionalFields {
            result.merge(fields) { (_, new) in new }
        }

        return result
    }
}

    // MARK: - Blob Fetching from WebView

    /// Fetch a blob from a browser-created blob URL
    /// - Parameters:
    ///   - blobUrl: A browser blob URL (e.g., "blob:http://...")
    ///   - webView: The WKWebView that created the blob
    ///   - completion: Called with the fetched data or error
    @objc public func fetchWebViewBlob(blobUrl: String, from webView: WKWebView, completion: @escaping (Data?, String?, Error?) -> Void) {
        // Use JavaScript to read the blob as base64 (we have to for cross-process transfer)
        // But this is a one-time conversion that happens in the browser's optimized code
        let script = """
        (async function() {
            try {
                const response = await fetch('\(blobUrl)');
                const blob = await response.blob();

                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = reader.result.split(',')[1];
                        resolve({
                            data: base64,
                            type: blob.type,
                            size: blob.size
                        });
                    };
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                return { error: error.message };
            }
        })();
        """

        webView.evaluateJavaScript(script) { (result, error) in
            if let error = error {
                completion(nil, nil, error)
                return
            }

            guard let resultDict = result as? [String: Any],
                  let base64String = resultDict["data"] as? String,
                  let mimeType = resultDict["type"] as? String else {
                if let resultDict = result as? [String: Any],
                   let errorMsg = resultDict["error"] as? String {
                    completion(nil, nil, NSError(
                        domain: "CAPBlobStore",
                        code: -1,
                        userInfo: [NSLocalizedDescriptionKey: errorMsg]
                    ))
                } else {
                    completion(nil, nil, NSError(
                        domain: "CAPBlobStore",
                        code: -1,
                        userInfo: [NSLocalizedDescriptionKey: "Invalid response from blob fetch"]
                    ))
                }
                return
            }

            guard let data = Data(base64Encoded: base64String) else {
                completion(nil, nil, NSError(
                    domain: "CAPBlobStore",
                    code: -1,
                    userInfo: [NSLocalizedDescriptionKey: "Failed to decode base64 data"]
                ))
                return
            }

            CAPLog.print("📥 BlobStore: Fetched \(data.count) bytes from browser blob")
            completion(data, mimeType, nil)
        }
    }
}

// MARK: - CAPPluginCall Extension

extension CAPPluginCall {
    /// Resolve with binary data as a blob URL (more efficient than base64)
    /// - Parameters:
    ///   - data: Binary data to return
    ///   - mimeType: MIME type of the data
    ///   - additionalData: Optional additional fields to include
    @objc public func resolveWithBlob(data: Data, mimeType: String, additionalData: PluginCallResultData? = nil) {
        guard let blobResponse = CAPBlobStore.shared.createBlobResponse(
            data: data,
            mimeType: mimeType,
            additionalFields: additionalData
        ) else {
            reject("Failed to create blob storage")
            return
        }

        resolve(blobResponse)
    }

    /// Get binary data from a blob URL parameter (from JavaScript blob)
    /// - Parameters:
    ///   - key: The parameter key containing the blob URL
    ///   - completion: Called with the fetched data and mime type
    @objc public func getBlobData(for key: String, completion: @escaping (Data?, String?, Error?) -> Void) {
        guard let blobUrl = getString(key) else {
            completion(nil, nil, NSError(
                domain: "CAPPluginCall",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Missing or invalid blob URL parameter: \(key)"]
            ))
            return
        }

        // Check if this is a Capacitor blob (already in our store)
        if blobUrl.starts(with: "blob:capacitor://") {
            if let (data, mimeType) = CAPBlobStore.shared.retrieve(blobUrl: blobUrl) {
                completion(data, mimeType, nil)
            } else {
                completion(nil, nil, NSError(
                    domain: "CAPPluginCall",
                    code: -1,
                    userInfo: [NSLocalizedDescriptionKey: "Blob not found in store"]
                ))
            }
            return
        }

        // Otherwise, it's a browser blob URL - fetch it from the webview
        guard let webView = bridge?.webView else {
            completion(nil, nil, NSError(
                domain: "CAPPluginCall",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "WebView not available"]
            ))
            return
        }

        CAPBlobStore.shared.fetchWebViewBlob(blobUrl: blobUrl, from: webView, completion: completion)
    }
}
