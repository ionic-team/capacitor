package com.getcapacitor;

import android.util.Log;
import android.webkit.WebView;

import androidx.annotation.Nullable;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Manages temporary blob storage for efficient binary data transfer between native and JavaScript
 */
public class BlobStore {

    private static final String TAG = "Capacitor/BlobStore";
    private static BlobStore instance;

    // Blob entry class
    private static class BlobEntry {
        final byte[] data;
        final String mimeType;
        final long createdAt;
        int accessCount;

        BlobEntry(byte[] data, String mimeType) {
            this.data = data;
            this.mimeType = mimeType;
            this.createdAt = System.currentTimeMillis();
            this.accessCount = 0;
        }
    }

    private final Map<String, BlobEntry> storage = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor = Executors.newSingleThreadScheduledExecutor();

    // Configuration
    private long maxBlobLifetime = 5 * 60 * 1000; // 5 minutes in milliseconds
    private long maxStorageSize = 50 * 1024 * 1024; // 50MB
    private long currentStorageSize = 0;

    private BlobStore() {
        // Start cleanup timer (runs every minute)
        cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredBlobs, 60, 60, TimeUnit.SECONDS);
    }

    public static synchronized BlobStore getInstance() {
        if (instance == null) {
            instance = new BlobStore();
        }
        return instance;
    }

    /**
     * Store binary data and return a blob URL
     * @param data Binary data to store
     * @param mimeType MIME type of the data
     * @return Blob URL string that can be used to retrieve the data, or null if storage limit exceeded
     */
    @Nullable
    public synchronized String store(byte[] data, String mimeType) {
        // Check size limits
        if (data.length + currentStorageSize > maxStorageSize) {
            Log.w(TAG, "Storage limit exceeded");
            return null;
        }

        String blobId = UUID.randomUUID().toString();
        String blobUrl = "blob:capacitor://" + blobId;

        BlobEntry entry = new BlobEntry(data, mimeType);
        storage.put(blobId, entry);
        currentStorageSize += data.length;

        Log.d(TAG, "Stored " + data.length + " bytes as " + blobUrl);
        return blobUrl;
    }

    /**
     * Retrieve data for a blob URL
     * @param blobUrl The blob URL (format: "blob:capacitor://<uuid>")
     * @return BlobData object if found, null otherwise
     */
    @Nullable
    public BlobData retrieve(String blobUrl) {
        String blobId = extractBlobId(blobUrl);
        if (blobId == null) {
            return null;
        }

        BlobEntry entry = storage.get(blobId);
        if (entry == null) {
            return null;
        }

        // Increment access count
        entry.accessCount++;

        return new BlobData(entry.data, entry.mimeType);
    }

    /**
     * Remove a specific blob from storage
     * @param blobUrl The blob URL to remove
     */
    public synchronized void remove(String blobUrl) {
        String blobId = extractBlobId(blobUrl);
        if (blobId == null) {
            return;
        }

        BlobEntry entry = storage.remove(blobId);
        if (entry != null) {
            currentStorageSize -= entry.data.length;
            Log.d(TAG, "Removed blob " + blobId);
        }
    }

    /**
     * Clear all stored blobs
     */
    public synchronized void clearAll() {
        int count = storage.size();
        storage.clear();
        currentStorageSize = 0;
        Log.d(TAG, "Cleared all " + count + " blobs");
    }

    /**
     * Create a JSObject with a blob URL reference
     * @param data Binary data to store
     * @param mimeType MIME type of the data
     * @return JSObject with blob URL and metadata, or null if storage failed
     */
    @Nullable
    public JSObject createBlobResponse(byte[] data, String mimeType) {
        String blobUrl = store(data, mimeType);
        if (blobUrl == null) {
            return null;
        }

        JSObject result = new JSObject();
        result.put("blob", blobUrl);
        result.put("type", mimeType);
        result.put("size", data.length);

        return result;
    }

    /**
     * Fetch a blob from a browser-created blob URL
     * @param blobUrl Browser blob URL (e.g., "blob:http://...")
     * @param webView The WebView that created the blob
     * @param callback Called with the fetched data or error
     */
    public void fetchWebViewBlob(String blobUrl, WebView webView, BlobFetchCallback callback) {
        String script = String.format(
            "(async function() {" +
            "  try {" +
            "    const response = await fetch('%s');" +
            "    const blob = await response.blob();" +
            "    return new Promise((resolve) => {" +
            "      const reader = new FileReader();" +
            "      reader.onloadend = () => {" +
            "        const base64 = reader.result.split(',')[1];" +
            "        resolve({" +
            "          data: base64," +
            "          type: blob.type," +
            "          size: blob.size" +
            "        });" +
            "      };" +
            "      reader.readAsDataURL(blob);" +
            "    });" +
            "  } catch (error) {" +
            "    return { error: error.message };" +
            "  }" +
            "})();",
            blobUrl
        );

        webView.evaluateJavascript(script, result -> {
            if (result == null || result.equals("null")) {
                callback.onError("No response from blob fetch");
                return;
            }

            try {
                JSONObject resultJson = new JSONObject(result);

                if (resultJson.has("error")) {
                    callback.onError(resultJson.getString("error"));
                    return;
                }

                String base64Data = resultJson.getString("data");
                String mimeType = resultJson.getString("type");

                byte[] data = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);

                Log.d(TAG, "Fetched " + data.length + " bytes from browser blob");
                callback.onSuccess(data, mimeType);

            } catch (JSONException e) {
                callback.onError("Failed to parse blob response: " + e.getMessage());
            }
        });
    }

    // Private methods

    @Nullable
    private String extractBlobId(String blobUrl) {
        if (!blobUrl.startsWith("blob:capacitor://")) {
            return null;
        }
        return blobUrl.substring("blob:capacitor://".length());
    }

    private synchronized void cleanupExpiredBlobs() {
        long now = System.currentTimeMillis();
        int removedCount = 0;
        long removedSize = 0;

        for (Map.Entry<String, BlobEntry> entry : storage.entrySet()) {
            long age = now - entry.getValue().createdAt;
            if (age > maxBlobLifetime) {
                BlobEntry blobEntry = storage.remove(entry.getKey());
                if (blobEntry != null) {
                    removedCount++;
                    removedSize += blobEntry.data.length;
                }
            }
        }

        if (removedCount > 0) {
            currentStorageSize -= removedSize;
            Log.d(TAG, "Cleaned up " + removedCount + " expired blobs (" + removedSize + " bytes)");
        }
    }

    // Data classes and callbacks

    public static class BlobData {
        public final byte[] data;
        public final String mimeType;

        BlobData(byte[] data, String mimeType) {
            this.data = data;
            this.mimeType = mimeType;
        }
    }

    public interface BlobFetchCallback {
        void onSuccess(byte[] data, String mimeType);
        void onError(String error);
    }
}
