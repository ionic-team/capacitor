package com.getcapacitor;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class BlobStoreTest {

    private BlobStore blobStore;

    @Before
    public void setUp() {
        blobStore = BlobStore.getInstance();
        blobStore.clearAll();
    }

    @After
    public void tearDown() {
        blobStore.clearAll();
    }

    // MARK: - Storage Tests

    @Test
    public void testStoreAndRetrieve() {
        // Given
        byte[] testData = "Hello, Blob!".getBytes(StandardCharsets.UTF_8);
        String mimeType = "text/plain";

        // When
        String blobUrl = blobStore.store(testData, mimeType);

        // Then
        assertNotNull("Blob URL should not be null", blobUrl);
        assertTrue("Blob URL should have correct format", blobUrl.startsWith("blob:capacitor://"));

        // Retrieve and verify
        BlobStore.BlobData retrieved = blobStore.retrieve(blobUrl);
        assertNotNull("Retrieved data should not be null", retrieved);
        assertArrayEquals("Retrieved data should match original", testData, retrieved.data);
        assertEquals("Retrieved mime type should match original", mimeType, retrieved.mimeType);
    }

    @Test
    public void testStoreLargeBinaryData() {
        // Given - 1MB of data
        int dataSize = 1024 * 1024;
        byte[] testData = new byte[dataSize];
        for (int i = 0; i < dataSize; i++) {
            testData[i] = (byte) (i % 256);
        }
        String mimeType = "application/octet-stream";

        // When
        String blobUrl = blobStore.store(testData, mimeType);

        // Then
        assertNotNull("Should handle large binary data", blobUrl);
        BlobStore.BlobData retrieved = blobStore.retrieve(blobUrl);
        assertArrayEquals("Large binary data should be retrieved correctly", testData, retrieved.data);
    }

    @Test
    public void testStoreImageData() {
        // Given - Simulate PNG image data
        byte[] pngHeader = new byte[] {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
        };
        String mimeType = "image/png";

        // When
        String blobUrl = blobStore.store(pngHeader, mimeType);

        // Then
        assertNotNull(blobUrl);
        BlobStore.BlobData retrieved = blobStore.retrieve(blobUrl);
        assertEquals("Should preserve image mime type", mimeType, retrieved.mimeType);
        assertArrayEquals("Should preserve image data integrity", pngHeader, retrieved.data);
    }

    @Test
    public void testStoreMultipleBlobs() {
        // Given
        byte[] blob1 = "Blob 1".getBytes(StandardCharsets.UTF_8);
        byte[] blob2 = "Blob 2".getBytes(StandardCharsets.UTF_8);
        byte[] blob3 = "Blob 3".getBytes(StandardCharsets.UTF_8);

        // When
        String url1 = blobStore.store(blob1, "text/plain");
        String url2 = blobStore.store(blob2, "text/plain");
        String url3 = blobStore.store(blob3, "text/plain");

        // Then
        assertNotEquals("Each blob should have unique URL", url1, url2);
        assertNotEquals("Each blob should have unique URL", url2, url3);
        assertNotEquals("Each blob should have unique URL", url1, url3);

        // All should be retrievable
        assertNotNull(blobStore.retrieve(url1));
        assertNotNull(blobStore.retrieve(url2));
        assertNotNull(blobStore.retrieve(url3));
    }

    @Test
    public void testRetrieveNonexistentBlob() {
        // Given
        String fakeBlobUrl = "blob:capacitor://nonexistent-uuid";

        // When
        BlobStore.BlobData result = blobStore.retrieve(fakeBlobUrl);

        // Then
        assertNull("Should return null for nonexistent blob", result);
    }

    @Test
    public void testRetrieveInvalidBlobUrl() {
        // Given
        String[] invalidUrls = {
            "not-a-blob-url",
            "blob://wrong-scheme",
            "blob:capacitor:/", // Missing ID
            ""
        };

        // When/Then
        for (String invalidUrl : invalidUrls) {
            BlobStore.BlobData result = blobStore.retrieve(invalidUrl);
            assertNull("Should return null for invalid blob URL: " + invalidUrl, result);
        }
    }

    // MARK: - Removal Tests

    @Test
    public void testRemoveBlob() {
        // Given
        byte[] testData = "Remove me".getBytes(StandardCharsets.UTF_8);
        String blobUrl = blobStore.store(testData, "text/plain");

        // Verify it exists
        assertNotNull(blobStore.retrieve(blobUrl));

        // When
        blobStore.remove(blobUrl);

        // Then
        assertNull("Blob should be removed", blobStore.retrieve(blobUrl));
    }

    @Test
    public void testClearAll() {
        // Given
        String blob1 = blobStore.store("Blob 1".getBytes(StandardCharsets.UTF_8), "text/plain");
        String blob2 = blobStore.store("Blob 2".getBytes(StandardCharsets.UTF_8), "text/plain");

        // When
        blobStore.clearAll();

        // Then
        assertNull("All blobs should be cleared", blobStore.retrieve(blob1));
        assertNull("All blobs should be cleared", blobStore.retrieve(blob2));
    }

    // MARK: - Response Creation Tests

    @Test
    public void testCreateBlobResponse() throws Exception {
        // Given
        byte[] testData = "Response data".getBytes(StandardCharsets.UTF_8);
        String mimeType = "text/plain";

        // When
        JSObject response = blobStore.createBlobResponse(testData, mimeType);

        // Then
        assertNotNull("Response should be created", response);
        assertNotNull("Response should contain blob URL", response.getString("blob"));
        assertEquals("Response should contain mime type", mimeType, response.getString("type"));
        assertEquals("Response should contain size", testData.length, response.getInteger("size").intValue());
    }

    // MARK: - Blob URL Format Tests

    @Test
    public void testBlobUrlFormat() {
        // Given
        byte[] testData = "Format test".getBytes(StandardCharsets.UTF_8);

        // When
        String blobUrl = blobStore.store(testData, "text/plain");

        // Then
        assertTrue("Should start with blob:capacitor://", blobUrl.startsWith("blob:capacitor://"));

        // Extract UUID and verify format
        String uuid = blobUrl.replace("blob:capacitor://", "");
        assertFalse("Should contain UUID", uuid.isEmpty());
        assertEquals("UUID should be standard format", 36, uuid.length());
        assertTrue("Should contain dashes", uuid.contains("-"));
    }

    // MARK: - MIME Type Tests

    @Test
    public void testVariousMimeTypes() {
        String[] mimeTypes = {
            "text/plain",
            "application/json",
            "image/png",
            "image/jpeg",
            "video/mp4",
            "application/pdf",
            "application/octet-stream"
        };

        for (String mimeType : mimeTypes) {
            // Given
            byte[] testData = new byte[100];
            for (int i = 0; i < 100; i++) {
                testData[i] = 0x42;
            }

            // When
            String blobUrl = blobStore.store(testData, mimeType);

            // Then
            assertNotNull("Should handle mime type: " + mimeType, blobUrl);
            BlobStore.BlobData retrieved = blobStore.retrieve(blobUrl);
            assertEquals("Should preserve mime type: " + mimeType, mimeType, retrieved.mimeType);
        }
    }

    // MARK: - Thread Safety Tests

    @Test
    public void testConcurrentStoreAndRetrieve() throws InterruptedException {
        // Given
        int threadCount = 10;
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        List<String> urls = new ArrayList<>();

        // When - Multiple concurrent stores
        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            new Thread(() -> {
                try {
                    byte[] data = ("Concurrent " + index).getBytes(StandardCharsets.UTF_8);
                    String url = blobStore.store(data, "text/plain");
                    synchronized (urls) {
                        urls.add(url);
                    }
                    BlobStore.BlobData retrieved = blobStore.retrieve(url);
                    if (retrieved != null && new String(retrieved.data, StandardCharsets.UTF_8).equals("Concurrent " + index)) {
                        successCount.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            }).start();
        }

        // Then
        assertTrue("All threads should complete", latch.await(5, TimeUnit.SECONDS));
        assertEquals("All concurrent operations should succeed", threadCount, successCount.get());
        assertEquals("All URLs should be unique", threadCount, urls.stream().distinct().count());
    }

    // MARK: - Edge Cases

    @Test
    public void testStoreEmptyData() {
        // Given
        byte[] emptyData = new byte[0];

        // When
        String blobUrl = blobStore.store(emptyData, "text/plain");

        // Then
        assertNotNull("Should handle empty data", blobUrl);
        BlobStore.BlobData retrieved = blobStore.retrieve(blobUrl);
        assertEquals("Empty data should be retrievable", 0, retrieved.data.length);
    }

    @Test
    public void testStoreWithEmptyMimeType() {
        // Given
        byte[] testData = "Test".getBytes(StandardCharsets.UTF_8);

        // When
        String blobUrl = blobStore.store(testData, "");

        // Then
        assertNotNull(blobUrl);
        BlobStore.BlobData retrieved = blobStore.retrieve(blobUrl);
        assertEquals("Should preserve empty mime type", "", retrieved.mimeType);
    }

    @Test
    public void testStoreWithNullMimeType() {
        // Given
        byte[] testData = "Test".getBytes(StandardCharsets.UTF_8);

        // When
        String blobUrl = blobStore.store(testData, null);

        // Then
        assertNotNull("Should handle null mime type", blobUrl);
        BlobStore.BlobData retrieved = blobStore.retrieve(blobUrl);
        assertNull("Should preserve null mime type", retrieved.mimeType);
    }

    @Test
    public void testAccessCount() {
        // Given
        byte[] testData = "Access count test".getBytes(StandardCharsets.UTF_8);
        String blobUrl = blobStore.store(testData, "text/plain");

        // When - Retrieve multiple times
        for (int i = 0; i < 5; i++) {
            assertNotNull("Should be accessible multiple times", blobStore.retrieve(blobUrl));
        }

        // Then - Data should still be accessible
        BlobStore.BlobData result = blobStore.retrieve(blobUrl);
        assertNotNull("Should still be accessible after multiple retrievals", result);
        assertArrayEquals("Data should remain intact", testData, result.data);
    }

    @Test
    public void testUnicodeData() {
        // Given
        String unicodeText = "Hello 世界 🌍 مرحبا";
        byte[] testData = unicodeText.getBytes(StandardCharsets.UTF_8);
        String mimeType = "text/plain; charset=utf-8";

        // When
        String blobUrl = blobStore.store(testData, mimeType);

        // Then
        assertNotNull(blobUrl);
        BlobStore.BlobData retrieved = blobStore.retrieve(blobUrl);
        String retrievedText = new String(retrieved.data, StandardCharsets.UTF_8);
        assertEquals("Should preserve Unicode text", unicodeText, retrievedText);
        assertEquals("Should preserve charset in mime type", mimeType, retrieved.mimeType);
    }
}
