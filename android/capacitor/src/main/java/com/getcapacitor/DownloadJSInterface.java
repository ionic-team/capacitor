package com.getcapacitor;

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
    final private DownloadJSOperationController operationsController;
    final private ActivityResultLauncher<DownloadJSOperationController.Input> launcher;
    final private HashMap<String, DownloadJSOperationController.Input> pendingInputs;
    final private Bridge bridge;
    //
    public DownloadJSInterface(Bridge bridge) {
        this.operationsController = new DownloadJSOperationController(bridge.getActivity());
        this.pendingInputs = new HashMap<>();
        this.bridge = bridge;
        this.launcher = bridge.getActivity().registerForActivityResult(this.operationsController,
                result -> Logger.debug("DownloadJSActivity result", String.valueOf(result)));
    }

    /* JavascriptInterface imp. */
    @JavascriptInterface
    public void receiveContentTypeFromJavascript(String contentType, String operationID) {
        //Transition pending input operation to started with resolved content type
        this.transitionPendingInputOperation(operationID, contentType, null);
    }
    @JavascriptInterface
    public void receiveStreamChunkFromJavascript(String chunk, String operationID) {
        //Guarantee pending input transition to started operation (when no content type is resolved)
        this.transitionPendingInputOperation(operationID, null, null);
        //Append data to operation
        this.operationsController.appendToOperation(operationID, chunk);
    }
    @JavascriptInterface
    public void receiveStreamErrorFromJavascript(String error, String operationID) {
        //Guarantee pending input transition to 'started-but-stale' operation before actually failing
        this.transitionPendingInputOperation(operationID, null, true);
        //Fail operation signal
        if (!this.operationsController.failOperation(operationID)) return;
        //Notify
        this.bridge.getApp().fireDownloadUpdate(operationID, App.DownloadStatus.FAILED, error);
    }
    @JavascriptInterface
    public void receiveStreamCompletionFromJavascript(String operationID) {
        //Complete operation signal
        if (!this.operationsController.completeOperation(operationID)) return;
        //Notify
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
            //setup background operation input (not started yet)
            //will wait either stream start on content-type resolution to start asking
            //for file pick and stream drain
            String operationID = UUID.randomUUID().toString();
            DownloadJSOperationController.Input input = new DownloadJSOperationController.Input(operationID, fileURL, mimeType, contentDisposition);
            this.pendingInputs.put(operationID, input);
            //Return JS bridge with operationID tagged
            return this.getJavascriptInterfaceBridgeForReadyAvailableData(fileURL, mimeType, operationID);
        }
        return null;
    }
    /* Injectors */
    private String getJavascriptInterfaceBridgeForReadyAvailableData(String blobUrl, String mimeType, String operationID) {
        return "javascript: " +
                "" +
                "function parseFile(file, chunkReadCallback, errorCallback, successCallback) {\n" +
                "    let fileSize   = file.size;" +
                "    let chunkSize  = 64 * 1024;" +
                "    let offset     = 0;" +
                "    let self       = this;" +
                "    let readBlock  = null;" +
                "    let onLoadHandler = function(evt) {" +
                "        if (evt.target.error == null) {" +
                "            offset += evt.target.result.length;" +
                "            chunkReadCallback(evt.target.result);" +
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
                "        r.readAsBinaryString(blob);" +
                "    };" +
                "    readBlock(offset, chunkSize, file);" +
                "};\n" +
                "(() => { let xhr = new XMLHttpRequest();" +
                "xhr.open('GET', '"+ blobUrl +"', true);" +
                ((mimeType != null && mimeType.length() > 0) ? "xhr.setRequestHeader('Content-type','" + mimeType + "');" : "") +
                "xhr.responseType = 'blob';" +
                "xhr.onerror = xhr.onload = function(e) {" +
                "    if (this.status == 200) {" +
                "        let contentType = this.getResponseHeader('content-type');" +
                "        if (contentType) { CapacitorDownloadInterface.receiveContentTypeFromJavascript(contentType, '" + operationID + "'); }" +
                "        var blob = this.response;" +
                "        parseFile(blob, " +
                "         function(chunk) { CapacitorDownloadInterface.receiveStreamChunkFromJavascript(chunk, '" + operationID + "'); }," +
                "         function(err) { console.error('[Capacitor XHR] - error:', err); CapacitorDownloadInterface.receiveStreamChunkFromJavascript(err.message, '" + operationID + "'); }, " +
                "         function() { console.log('[Capacitor XHR] - Drained!'); CapacitorDownloadInterface.receiveStreamCompletionFromJavascript('" + operationID + "'); } " +
                "        );" +
                "    } else {" +
                "         console.error('[Capacitor XHR] - error:', this.status, (e ? e.loaded : this.responseText));" +
                "    }" +
                "};" +
                "xhr.send();})()";
    }

    /* Helpers */
    private void transitionPendingInputOperation(String operationID, @Nullable String optionalContentType, @Nullable Boolean doNotStart) {
        //Check if have pending input operation, if not, we discard this content type resolution
        //for some awkward reason the chunk was received before
        DownloadJSOperationController.Input input = this.pendingInputs.get(operationID);
        if (input == null) return;
        //Set content type if available (override, no problem with that)
        if (optionalContentType != null) {
            Logger.debug("Received content type", optionalContentType);
            input.optionalMimeType = optionalContentType;
        }
        //Start operation
        this.pendingInputs.remove(operationID);
        if (doNotStart == null || !doNotStart) this.launcher.launch(input);
        //Notify
        this.bridge.getApp().fireDownloadUpdate(operationID, App.DownloadStatus.STARTED, null);
        return;
    }
}
