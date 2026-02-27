# Blob Transfer API

## Overview

The Blob Transfer API provides efficient binary data transfer between native code and JavaScript without base64 encoding overhead. This is particularly useful for:

- Image data transfer
- File operations
- Audio/video data
- Large binary payloads
- Any scenario where base64 encoding is a performance bottleneck

## Performance Benefits

### Traditional Base64 Approach
```
Native Binary Data (1MB)
  → Base64 Encode (33% size increase = 1.33MB)
  → JSON Serialize
  → JavaScript receives 1.33MB string
  → Base64 Decode back to binary
```

### Blob Transfer Approach
```
Native Binary Data (1MB)
  → Store in BlobStore
  → Send blob URL (< 100 bytes)
  → JavaScript receives tiny URL string
  → Access blob directly via URL
```

**Result**: ~99% reduction in data transferred over the bridge for large binaries.

## API Reference

### iOS (Swift)

#### Returning Blob Data from Plugin

```swift
import Capacitor

@objc(MyPlugin)
public class MyPlugin: CAPPlugin {

    @objc func getImage(_ call: CAPPluginCall) {
        // Load image data
        guard let image = UIImage(named: "example"),
              let imageData = image.pngData() else {
            call.reject("Failed to load image")
            return
        }

        // Return as blob - much faster than base64!
        call.resolveWithBlob(
            data: imageData,
            mimeType: "image/png",
            additionalData: [
                "width": image.size.width,
                "height": image.size.height
            ]
        )
    }

    @objc func downloadFile(_ call: CAPPluginCall) {
        let url = URL(string: call.getString("url") ?? "")!

        // Download file
        URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data else {
                call.reject("Download failed")
                return
            }

            // Get mime type from response
            let mimeType = response?.mimeType ?? "application/octet-stream"

            // Return as blob
            call.resolveWithBlob(
                data: data,
                mimeType: mimeType
            )
        }.resume()
    }
}
```

#### Receiving Blob Data in Plugin

```swift
@objc func saveImage(_ call: CAPPluginCall) {
    // JavaScript sends: { blob: "blob:capacitor://..." }
    call.getBlobData(for: "blob") { data, mimeType, error in
        if let error = error {
            call.reject("Failed to get blob data: \(error.localizedDescription)")
            return
        }

        guard let data = data else {
            call.reject("No data received")
            return
        }

        // Save the data
        let documentsPath = FileManager.default.urls(
            for: .documentDirectory,
            in: .userDomainMask
        ).first!

        let fileURL = documentsPath.appendingPathComponent("saved-image.png")

        do {
            try data.write(to: fileURL)
            call.resolve([
                "path": fileURL.path,
                "size": data.count
            ])
        } catch {
            call.reject("Failed to save file: \(error.localizedDescription)")
        }
    }
}
```

#### Receiving Browser Blob from JavaScript

```swift
@objc func processBlob(_ call: CAPPluginCall) {
    // JavaScript creates a blob: const blob = new Blob([data], { type: 'image/png' })
    // Then sends the blob URL: await MyPlugin.processBlob({ blob: URL.createObjectURL(blob) })

    call.getBlobData(for: "blob") { data, mimeType, error in
        if let error = error {
            call.reject(error.localizedDescription)
            return
        }

        // Process the binary data
        // getBlobData automatically handles both:
        // - Capacitor blob URLs (blob:capacitor://...)
        // - Browser blob URLs (blob:http://...)

        call.resolve([
            "processed": true,
            "size": data?.count ?? 0,
            "type": mimeType ?? "unknown"
        ])
    }
}
```

### Android (Java)

#### Returning Blob Data from Plugin

```java
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;

@CapacitorPlugin(name = "MyPlugin")
public class MyPlugin extends Plugin {

    @PluginMethod
    public void getImage(PluginCall call) {
        // Load image from resources
        InputStream is = getContext().getResources().openRawResource(R.drawable.example);
        byte[] imageData = readInputStream(is);

        // Return as blob - much faster than base64!
        call.resolveWithBlob(imageData, "image/png");
    }

    @PluginMethod
    public void downloadFile(PluginCall call) {
        String url = call.getString("url");

        // Download file
        new Thread(() -> {
            try {
                URL fileUrl = new URL(url);
                InputStream input = fileUrl.openStream();
                byte[] data = readInputStream(input);
                String mimeType = URLConnection.guessContentTypeFromStream(input);

                // Return as blob
                call.resolveWithBlob(data, mimeType);
            } catch (Exception e) {
                call.reject("Download failed", e);
            }
        }).start();
    }

    @PluginMethod
    public void capturePhoto(PluginCall call) {
        // Capture photo and get bitmap
        Bitmap bitmap = captureBitmapFromCamera();

        // Convert to PNG
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream);
        byte[] byteArray = stream.toByteArray();

        // Return as blob with additional metadata
        JSObject additionalData = new JSObject();
        additionalData.put("width", bitmap.getWidth());
        additionalData.put("height", bitmap.getHeight());

        call.resolveWithBlob(byteArray, "image/png", additionalData);
    }
}
```

#### Receiving Blob Data in Plugin

```java
@PluginMethod
public void saveImage(PluginCall call) {
    // JavaScript sends: { blob: "blob:capacitor://..." }
    call.getBlobData("blob", new PluginCall.BlobDataCallback() {
        @Override
        public void onSuccess(byte[] data, String mimeType) {
            // Save the data
            File file = new File(getContext().getFilesDir(), "saved-image.png");

            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(data);

                JSObject result = new JSObject();
                result.put("path", file.getAbsolutePath());
                result.put("size", data.length);
                call.resolve(result);
            } catch (IOException e) {
                call.reject("Failed to save file", e);
            }
        }

        @Override
        public void onError(String error) {
            call.reject("Failed to get blob data: " + error);
        }
    });
}
```

#### Receiving Browser Blob from JavaScript

```java
@PluginMethod
public void processBlob(PluginCall call) {
    // JavaScript creates a blob and sends its URL
    call.getBlobData("blob", new PluginCall.BlobDataCallback() {
        @Override
        public void onSuccess(byte[] data, String mimeType) {
            // Process the binary data
            // getBlobData automatically handles both:
            // - Capacitor blob URLs (blob:capacitor://...)
            // - Browser blob URLs (blob:http://...)

            JSObject result = new JSObject();
            result.put("processed", true);
            result.put("size", data.length);
            result.put("type", mimeType);
            call.resolve(result);
        }

        @Override
        public void onError(String error) {
            call.reject(error);
        }
    });
}
```

### JavaScript/TypeScript

#### Receiving Blob from Native

```typescript
import { registerPlugin } from '@capacitor/core';

interface MyPlugin {
  getImage(): Promise<{ blob: string; type: string; size: number; width: number; height: number }>;
  downloadFile(options: { url: string }): Promise<{ blob: string; type: string; size: number }>;
}

const MyPlugin = registerPlugin<MyPlugin>('MyPlugin');

// Get image as blob
async function displayImage() {
  // Get blob URL from native
  const result = await MyPlugin.getImage();

  // Use blob URL directly in DOM
  const img = document.createElement('img');
  img.src = result.blob; // blob:capacitor://...
  document.body.appendChild(img);

  // Or convert to browser Blob for manipulation
  const response = await fetch(result.blob);
  const blob = await response.blob();

  // Now you can use standard Blob APIs
  const objectUrl = URL.createObjectURL(blob);
  const anotherImg = document.createElement('img');
  anotherImg.src = objectUrl;

  // Don't forget to revoke when done
  URL.revokeObjectURL(objectUrl);
}

// Download file as blob
async function downloadAndDisplay() {
  const result = await MyPlugin.downloadFile({
    url: 'https://example.com/large-file.pdf'
  });

  // Create download link
  const response = await fetch(result.blob);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'downloaded-file.pdf';
  a.click();

  URL.revokeObjectURL(url);
}
```

#### Sending Blob to Native

```typescript
interface MyPlugin {
  saveImage(options: { blob: string }): Promise<{ path: string; size: number }>;
  processBlob(options: { blob: string }): Promise<{ processed: boolean; size: number }>;
}

const MyPlugin = registerPlugin<MyPlugin>('MyPlugin');

// Send browser blob to native
async function captureAndSave() {
  // Capture from canvas
  const canvas = document.querySelector('canvas');
  const blob = await new Promise<Blob>(resolve =>
    canvas.toBlob(resolve, 'image/png')
  );

  // Create blob URL
  const blobUrl = URL.createObjectURL(blob);

  // Send to native for saving
  const result = await MyPlugin.saveImage({ blob: blobUrl });
  console.log('Saved to:', result.path);

  // Clean up
  URL.revokeObjectURL(blobUrl);
}

// Send file input to native
async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files[0];

  // Create blob URL from file
  const blobUrl = URL.createObjectURL(file);

  // Process in native
  const result = await MyPlugin.processBlob({ blob: blobUrl });
  console.log('Processed:', result);

  URL.revokeObjectURL(blobUrl);
}

// Send fetch response to native
async function downloadAndProcess() {
  const response = await fetch('https://example.com/image.png');
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  // Send to native
  const result = await MyPlugin.processBlob({ blob: blobUrl });

  URL.revokeObjectURL(blobUrl);
}
```

## Best Practices

### 1. Blob Lifecycle Management

```typescript
// ✅ Good: Clean up blob URLs
async function processImage() {
  const { blob } = await MyPlugin.getImage();
  const img = document.createElement('img');
  img.src = blob;
  document.body.appendChild(img);

  // Blob URLs are automatically cleaned up after retrieval
  // No manual cleanup needed for Capacitor blob URLs
}

// ✅ Good: Clean up browser blob URLs
async function createBrowserBlob() {
  const response = await fetch(capacitorBlobUrl);
  const blob = await response.blob();
  const browserUrl = URL.createObjectURL(blob);

  // Use it
  img.src = browserUrl;

  // Clean up when done
  img.onload = () => URL.revokeObjectURL(browserUrl);
}
```

### 2. Error Handling

```swift
// iOS
@objc func getData(_ call: CAPPluginCall) {
    call.getBlobData(for: "input") { data, mimeType, error in
        if let error = error {
            call.reject("Blob error: \(error.localizedDescription)")
            return
        }

        guard let data = data, !data.isEmpty else {
            call.reject("Empty data received")
            return
        }

        // Process data
        call.resolve(["success": true])
    }
}
```

```java
// Android
@PluginMethod
public void getData(PluginCall call) {
    call.getBlobData("input", new PluginCall.BlobDataCallback() {
        @Override
        public void onSuccess(byte[] data, String mimeType) {
            if (data == null || data.length == 0) {
                call.reject("Empty data received");
                return;
            }
            // Process data
            call.resolve();
        }

        @Override
        public void onError(String error) {
            call.reject("Blob error: " + error);
        }
    });
}
```

### 3. Memory Management

```swift
// For large files, process in chunks
@objc func processLargeFile(_ call: CAPPluginCall) {
    call.getBlobData(for: "file") { data, mimeType, error in
        guard let data = data else {
            call.reject("No data")
            return
        }

        // Process in chunks to avoid memory pressure
        let chunkSize = 1024 * 1024 // 1MB chunks
        var offset = 0

        while offset < data.count {
            let end = min(offset + chunkSize, data.count)
            let chunk = data.subdata(in: offset..<end)
            processChunk(chunk)
            offset = end
        }

        call.resolve()
    }
}
```

### 4. Performance Comparison

```typescript
// ❌ Old way: Base64 encoding (slow for large data)
async function oldWay() {
  const result = await Filesystem.readFile({
    path: 'large-image.png',
    directory: Directory.Documents
  });

  // result.data is base64 string (33% larger than original)
  const img = document.createElement('img');
  img.src = `data:image/png;base64,${result.data}`;
}

// ✅ New way: Blob URL (fast, no encoding overhead)
async function newWay() {
  const result = await MyPlugin.readFile({
    path: 'large-image.png'
  });

  // result.blob is tiny URL string
  const img = document.createElement('img');
  img.src = result.blob; // Instant, no decoding needed
}
```

## Migration Guide

### From Base64 to Blob Transfer

**Before:**
```swift
@objc func getImage(_ call: CAPPluginCall) {
    let imageData = ... // Get image data
    let base64 = imageData.base64EncodedString()
    call.resolve(["data": base64])
}
```

**After:**
```swift
@objc func getImage(_ call: CAPPluginCall) {
    let imageData = ... // Get image data
    call.resolveWithBlob(data: imageData, mimeType: "image/png")
}
```

**JavaScript:**
```typescript
// Before
const { data } = await MyPlugin.getImage();
img.src = `data:image/png;base64,${data}`;

// After
const { blob } = await MyPlugin.getImage();
img.src = blob; // Direct use!
```

## Technical Details

### Blob URL Format

Capacitor blob URLs follow this format:
```
blob:capacitor://<uuid>
```

Example:
```
blob:capacitor://a3d5e7f9-1234-5678-90ab-cdef12345678
```

### Storage

- Blobs are stored in memory with automatic cleanup
- Default lifetime: 5 minutes
- Default size limit: 50MB
- Configurable per-platform

### Security

- Blob URLs are random UUIDs (non-guessable)
- Blobs are scoped to the app instance
- Automatic cleanup prevents memory leaks
- No cross-origin access issues

## Limitations

1. **One-time read for browser blobs**: When fetching a browser blob URL, the conversion to base64 happens once
2. **Memory storage**: Blobs are stored in RAM, not disk
3. **App lifetime**: Blobs are cleared when app terminates
4. **Same-context only**: Blob URLs only work within the same webview instance

## Examples

See the test files for comprehensive examples:
- iOS: `ios/Capacitor/CapacitorTests/BlobStoreTests.swift`
- Android: `android/capacitor/src/test/java/com/getcapacitor/BlobStoreTest.java`
