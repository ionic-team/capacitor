package com.getcapacitor;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import androidx.activity.result.ActivityResultLauncher;
import androidx.annotation.Nullable;
import java.util.HashMap;
import java.util.UUID;

/**
 * Represents the bridge.webview exposed JS download interface + proxy interface injector.
 * Every download request from webview will have their URLs + mime, content-disposition
 * analyzed in order to determine if we do have a injector that supports it and return
 * to the proxy in order to have that code executed exclusively for that request.
 */
public class DownloadJSInterface {

    private final DownloadJSOperationController operationsController;
    private final ActivityResultLauncher<DownloadJSOperationController.Input> launcher;
    private final HashMap<String, DownloadJSOperationController.Input> pendingInputs;
    private final Bridge bridge;

    public DownloadJSInterface(Bridge bridge) {
        this.operationsController = new DownloadJSOperationController(bridge.getActivity());
        this.pendingInputs = new HashMap<>();
        this.bridge = bridge;
        this.launcher =
            bridge
                .getActivity()
                .registerForActivityResult(
                    this.operationsController,
                    result -> Logger.debug("DownloadJSActivity result", String.valueOf(result))
                );
    }

    /* JavascriptInterface imp. */
    @JavascriptInterface
    public void receiveContentTypeFromJavascript(String contentType, String operationID) {
        this.transitionPendingInputOperation(operationID, contentType, false);
    }

    @JavascriptInterface
    public void receiveStreamChunkFromJavascript(String chunk, String operationID) {
        this.transitionPendingInputOperation(operationID, null, false);
        this.operationsController.appendToOperation(operationID, chunk);
    }

    @JavascriptInterface
    public void receiveStreamErrorFromJavascript(String error, String operationID) {
        // Drop pending input without launching the file picker or emitting STARTED.
        this.pendingInputs.remove(operationID);
        this.operationsController.failOperation(operationID);
        this.bridge.getApp().fireDownloadUpdate(operationID, App.DownloadStatus.FAILED, error);
    }

    @JavascriptInterface
    public void receiveStreamCompletionFromJavascript(String operationID) {
        if (!this.operationsController.completeOperation(operationID)) return;
        this.bridge.getApp().fireDownloadUpdate(operationID, App.DownloadStatus.COMPLETED, null);
    }

    /* Proxy injector
     *  This code analyze incoming download requests and return appropriated JS injectors.
     *  Injectors, handle the download request at the browser context and call the JSInterface
     *  with chunks of data to be written on the disk. This technic is specially useful for
     *  blobs and webworker initiated downloads.
     */
    public String getJavascriptBridgeForURL(String fileURL, String contentDisposition, String mimeType) {
        if (fileURL.startsWith("http://") || fileURL.startsWith("https://") || fileURL.startsWith("blob:")) {
            String operationID = UUID.randomUUID().toString();
            DownloadJSOperationController.Input input = new DownloadJSOperationController.Input(
                operationID,
                fileURL,
                mimeType,
                contentDisposition
            );
            this.pendingInputs.put(operationID, input);
            return this.getJavascriptInterfaceBridgeForReadyAvailableData(fileURL, mimeType, operationID);
        }
        return null;
    }

    /* Injectors */
    private String getJavascriptInterfaceBridgeForReadyAvailableData(String blobUrl, String mimeType, String operationID) {
        String escapedUrl = blobUrl.replace("\\", "\\\\").replace("'", "\\'");
        String acceptHeader =
            (mimeType != null && mimeType.length() > 0) ? "xhr.setRequestHeader('Accept','" + mimeType.replace("'", "") + "');" : "";
        return (
            "javascript: " +
            "function parseFile(file, chunkReadCallback, errorCallback, successCallback) {\n" +
            "    let fileSize   = file.size;" +
            "    let chunkSize  = 64 * 1024;" +
            "    let offset     = 0;" +
            "    let readBlock  = null;" +
            "    let onLoadHandler = function(evt) {" +
            "        if (evt.target.error == null) {" +
            "            var buf = evt.target.result;" +
            "            var bytes = new Uint8Array(buf);" +
            "            offset += bytes.length;" +
            "            var binary = '';" +
            "            for (var i = 0; i < bytes.length; i++) { binary += String.fromCharCode(bytes[i]); }" +
            "            chunkReadCallback(binary);" +
            "        } else {" +
            "            errorCallback(evt.target.error);" +
            "            return;" +
            "        }" +
            "        if (offset >= fileSize) {" +
            "            if (successCallback) successCallback();" +
            "            return;" +
            "        }" +
            "        readBlock(offset, chunkSize, file);" +
            "    };" +
            "    readBlock = function(_offset, length, _file) {" +
            "        var r = new FileReader();" +
            "        var blob = _file.slice(_offset, length + _offset);" +
            "        r.onload = onLoadHandler;" +
            "        r.readAsArrayBuffer(blob);" +
            "    };" +
            "    readBlock(offset, chunkSize, file);" +
            "};\n" +
            "(() => { let xhr = new XMLHttpRequest();" +
            "xhr.open('GET', '" +
            escapedUrl +
            "', true);" +
            acceptHeader +
            "xhr.responseType = 'blob';" +
            "xhr.onerror = function(e) {" +
            "    var msg = (e && e.type) ? e.type : 'network error';" +
            "    console.error('[Capacitor XHR] - error:', msg);" +
            "    CapacitorDownloadInterface.receiveStreamErrorFromJavascript(msg, '" +
            operationID +
            "');" +
            "};" +
            "xhr.onload = function(e) {" +
            "    if (this.status == 200) {" +
            "        let contentType = this.getResponseHeader('content-type');" +
            "        if (contentType) { CapacitorDownloadInterface.receiveContentTypeFromJavascript(contentType, '" +
            operationID +
            "'); }" +
            "        var blob = this.response;" +
            "        parseFile(blob, " +
            "         function(chunk) { CapacitorDownloadInterface.receiveStreamChunkFromJavascript(chunk, '" +
            operationID +
            "'); }," +
            "         function(err) { console.error('[Capacitor XHR] - error:', err); CapacitorDownloadInterface.receiveStreamErrorFromJavascript(err && err.message ? err.message : 'Unknown error', '" +
            operationID +
            "'); }, " +
            "         function() { console.log('[Capacitor XHR] - Drained!'); CapacitorDownloadInterface.receiveStreamCompletionFromJavascript('" +
            operationID +
            "'); } " +
            "        );" +
            "    } else {" +
            "         var msg = 'HTTP ' + this.status;" +
            "         console.error('[Capacitor XHR] - error:', this.status, (e ? e.loaded : this.responseText));" +
            "         CapacitorDownloadInterface.receiveStreamErrorFromJavascript(msg, '" +
            operationID +
            "');" +
            "    }" +
            "};" +
            "xhr.send();})()"
        );
    }

    /* Helpers */
    private void transitionPendingInputOperation(String operationID, @Nullable String optionalContentType, boolean doNotStart) {
        DownloadJSOperationController.Input input = this.pendingInputs.get(operationID);
        if (input == null) return;
        if (optionalContentType != null) {
            Logger.debug("Received content type", optionalContentType);
            input.optionalMimeType = optionalContentType;
        }
        this.pendingInputs.remove(operationID);
        Activity activity = bridge.getActivity();
        if (activity == null) return;
        activity.runOnUiThread(
            () -> {
                if (!doNotStart) {
                    launcher.launch(input);
                    bridge.getApp().fireDownloadUpdate(operationID, App.DownloadStatus.STARTED, null);
                }
            }
        );
    }
}
