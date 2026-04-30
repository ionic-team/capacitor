import XCTest
@testable import Capacitor

class BlobStoreTests: XCTestCase {

    var blobStore: CAPBlobStore!

    override func setUp() {
        super.setUp()
        blobStore = CAPBlobStore.shared
        blobStore.clearAll()
    }

    override func tearDown() {
        blobStore.clearAll()
        super.tearDown()
    }

    // MARK: - Storage Tests

    func testStoreAndRetrieve() {
        // Given
        let testData = "Hello, Blob!".data(using: .utf8)!
        let mimeType = "text/plain"

        // When
        let blobUrl = blobStore.store(data: testData, mimeType: mimeType)

        // Then
        XCTAssertNotNil(blobUrl, "Blob URL should not be nil")
        XCTAssertTrue(blobUrl!.starts(with: "blob:capacitor://"), "Blob URL should have correct format")

        // Retrieve and verify
        let retrieved = blobStore.retrieve(blobUrl: blobUrl!)
        XCTAssertNotNil(retrieved, "Retrieved data should not be nil")
        XCTAssertEqual(retrieved?.data, testData, "Retrieved data should match original")
        XCTAssertEqual(retrieved?.mimeType, mimeType, "Retrieved mime type should match original")
    }

    func testStoreLargeBinaryData() {
        // Given - 1MB of random data
        let dataSize = 1024 * 1024
        var bytes = [UInt8](repeating: 0, count: dataSize)
        for i in 0..<dataSize {
            bytes[i] = UInt8.random(in: 0...255)
        }
        let testData = Data(bytes)
        let mimeType = "application/octet-stream"

        // When
        let blobUrl = blobStore.store(data: testData, mimeType: mimeType)

        // Then
        XCTAssertNotNil(blobUrl, "Should handle large binary data")
        let retrieved = blobStore.retrieve(blobUrl: blobUrl!)
        XCTAssertEqual(retrieved?.data, testData, "Large binary data should be retrieved correctly")
    }

    func testStoreImageData() {
        // Given - Simulate PNG image data
        let pngHeader: [UInt8] = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
        let testData = Data(pngHeader)
        let mimeType = "image/png"

        // When
        let blobUrl = blobStore.store(data: testData, mimeType: mimeType)

        // Then
        XCTAssertNotNil(blobUrl)
        let retrieved = blobStore.retrieve(blobUrl: blobUrl!)
        XCTAssertEqual(retrieved?.mimeType, mimeType, "Should preserve image mime type")
        XCTAssertEqual(retrieved?.data, testData, "Should preserve image data integrity")
    }

    func testStoreMultipleBlobs() {
        // Given
        let blob1 = "Blob 1".data(using: .utf8)!
        let blob2 = "Blob 2".data(using: .utf8)!
        let blob3 = "Blob 3".data(using: .utf8)!

        // When
        let url1 = blobStore.store(data: blob1, mimeType: "text/plain")
        let url2 = blobStore.store(data: blob2, mimeType: "text/plain")
        let url3 = blobStore.store(data: blob3, mimeType: "text/plain")

        // Then
        XCTAssertNotEqual(url1, url2, "Each blob should have unique URL")
        XCTAssertNotEqual(url2, url3, "Each blob should have unique URL")
        XCTAssertNotEqual(url1, url3, "Each blob should have unique URL")

        // All should be retrievable
        XCTAssertNotNil(blobStore.retrieve(blobUrl: url1!))
        XCTAssertNotNil(blobStore.retrieve(blobUrl: url2!))
        XCTAssertNotNil(blobStore.retrieve(blobUrl: url3!))
    }

    func testRetrieveNonexistentBlob() {
        // Given
        let fakeBlobUrl = "blob:capacitor://nonexistent-uuid"

        // When
        let result = blobStore.retrieve(blobUrl: fakeBlobUrl)

        // Then
        XCTAssertNil(result, "Should return nil for nonexistent blob")
    }

    func testRetrieveInvalidBlobUrl() {
        // Given
        let invalidUrls = [
            "not-a-blob-url",
            "blob://wrong-scheme",
            "blob:capacitor:/", // Missing ID
            ""
        ]

        // When/Then
        for invalidUrl in invalidUrls {
            let result = blobStore.retrieve(blobUrl: invalidUrl)
            XCTAssertNil(result, "Should return nil for invalid blob URL: \(invalidUrl)")
        }
    }

    // MARK: - Removal Tests

    func testRemoveBlob() {
        // Given
        let testData = "Remove me".data(using: .utf8)!
        let blobUrl = blobStore.store(data: testData, mimeType: "text/plain")!

        // Verify it exists
        XCTAssertNotNil(blobStore.retrieve(blobUrl: blobUrl))

        // When
        blobStore.remove(blobUrl: blobUrl)

        // Then
        XCTAssertNil(blobStore.retrieve(blobUrl: blobUrl), "Blob should be removed")
    }

    func testClearAll() {
        // Given
        let blob1 = blobStore.store(data: "Blob 1".data(using: .utf8)!, mimeType: "text/plain")!
        let blob2 = blobStore.store(data: "Blob 2".data(using: .utf8)!, mimeType: "text/plain")!

        // When
        blobStore.clearAll()

        // Then
        XCTAssertNil(blobStore.retrieve(blobUrl: blob1), "All blobs should be cleared")
        XCTAssertNil(blobStore.retrieve(blobUrl: blob2), "All blobs should be cleared")
    }

    // MARK: - Size Limit Tests

    func testStorageSizeLimit() {
        // Given - Set a small limit for testing
        let originalLimit = blobStore.maxStorageSize
        blobStore.maxStorageSize = 1024 // 1KB limit

        // When - Try to store more than limit
        let largeData = Data(repeating: 0xFF, count: 2048) // 2KB
        let blobUrl = blobStore.store(data: largeData, mimeType: "application/octet-stream")

        // Then
        XCTAssertNil(blobUrl, "Should reject data exceeding storage limit")

        // Cleanup
        blobStore.maxStorageSize = originalLimit
    }

    func testMultipleBlobsWithinStorageLimit() {
        // Given
        let originalLimit = blobStore.maxStorageSize
        blobStore.maxStorageSize = 5000

        // When - Store multiple small blobs
        var urls: [String] = []
        for i in 0..<10 {
            let data = "Blob \(i)".data(using: .utf8)!
            if let url = blobStore.store(data: data, mimeType: "text/plain") {
                urls.append(url)
            }
        }

        // Then
        XCTAssertGreaterThan(urls.count, 0, "Should store multiple blobs within limit")

        // Cleanup
        blobStore.maxStorageSize = originalLimit
    }

    // MARK: - Response Creation Tests

    func testCreateBlobResponse() {
        // Given
        let testData = "Response data".data(using: .utf8)!
        let mimeType = "text/plain"

        // When
        let response = blobStore.createBlobResponse(data: testData, mimeType: mimeType)

        // Then
        XCTAssertNotNil(response, "Response should be created")
        XCTAssertNotNil(response?["blob"], "Response should contain blob URL")
        XCTAssertEqual(response?["type"] as? String, mimeType, "Response should contain mime type")
        XCTAssertEqual(response?["size"] as? Int, testData.count, "Response should contain size")
    }

    func testCreateBlobResponseWithAdditionalFields() {
        // Given
        let testData = "Data with metadata".data(using: .utf8)!
        let mimeType = "application/json"
        let additionalFields = [
            "filename": "test.json",
            "lastModified": 1234567890
        ] as [String: Any]

        // When
        let response = blobStore.createBlobResponse(
            data: testData,
            mimeType: mimeType,
            additionalFields: additionalFields
        )

        // Then
        XCTAssertNotNil(response)
        XCTAssertEqual(response?["filename"] as? String, "test.json")
        XCTAssertEqual(response?["lastModified"] as? Int, 1234567890)
        XCTAssertNotNil(response?["blob"], "Should still include blob URL")
    }

    // MARK: - Blob URL Format Tests

    func testBlobUrlFormat() {
        // Given
        let testData = "Format test".data(using: .utf8)!

        // When
        let blobUrl = blobStore.store(data: testData, mimeType: "text/plain")

        // Then
        XCTAssertTrue(blobUrl!.starts(with: "blob:capacitor://"))

        // Extract UUID and verify format
        let uuid = blobUrl!.replacingOccurrences(of: "blob:capacitor://", with: "")
        XCTAssertFalse(uuid.isEmpty, "Should contain UUID")
        XCTAssertTrue(uuid.count == 36, "UUID should be standard format")
    }

    // MARK: - MIME Type Tests

    func testVariousMimeTypes() {
        let mimeTypes = [
            "text/plain",
            "application/json",
            "image/png",
            "image/jpeg",
            "video/mp4",
            "application/pdf",
            "application/octet-stream"
        ]

        for mimeType in mimeTypes {
            // Given
            let testData = Data(repeating: 0x42, count: 100)

            // When
            let blobUrl = blobStore.store(data: testData, mimeType: mimeType)

            // Then
            XCTAssertNotNil(blobUrl, "Should handle mime type: \(mimeType)")
            let retrieved = blobStore.retrieve(blobUrl: blobUrl!)
            XCTAssertEqual(retrieved?.mimeType, mimeType, "Should preserve mime type: \(mimeType)")
        }
    }

    // MARK: - Thread Safety Tests

    func testConcurrentStoreAndRetrieve() {
        let expectation = XCTestExpectation(description: "Concurrent operations")
        expectation.expectedFulfillmentCount = 10

        // When - Multiple concurrent stores
        DispatchQueue.concurrentPerform(iterations: 10) { index in
            let data = "Concurrent \(index)".data(using: .utf8)!
            if let url = self.blobStore.store(data: data, mimeType: "text/plain") {
                if let retrieved = self.blobStore.retrieve(blobUrl: url) {
                    XCTAssertEqual(retrieved.data, data, "Data should match in concurrent access")
                }
            }
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    // MARK: - Edge Cases

    func testStoreEmptyData() {
        // Given
        let emptyData = Data()

        // When
        let blobUrl = blobStore.store(data: emptyData, mimeType: "text/plain")

        // Then
        XCTAssertNotNil(blobUrl, "Should handle empty data")
        let retrieved = blobStore.retrieve(blobUrl: blobUrl!)
        XCTAssertEqual(retrieved?.data.count, 0, "Empty data should be retrievable")
    }

    func testStoreWithEmptyMimeType() {
        // Given
        let testData = "Test".data(using: .utf8)!

        // When
        let blobUrl = blobStore.store(data: testData, mimeType: "")

        // Then
        XCTAssertNotNil(blobUrl)
        let retrieved = blobStore.retrieve(blobUrl: blobUrl!)
        XCTAssertEqual(retrieved?.mimeType, "", "Should preserve empty mime type")
    }
}
