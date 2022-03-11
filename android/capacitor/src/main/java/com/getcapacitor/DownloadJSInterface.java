package com.getcapacitor;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.text.TextUtils;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;

import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.appcompat.app.AppCompatActivity;
import java.util.UUID;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.Arrays;

/**
 * Represents the bridge.webview exposed JS download interface + proxy interface injector.
 * Every download request from webview will have their URLs + mime, content-disposition
 * analyzed in order to determine if we do have a injector that supports it and return
 * to the proxy in order to have that code executed exclusively for that request.
 */
public class DownloadJSInterface {
    private DownloadJSActivity downloadActivity;
    private ActivityResultLauncher<DownloadJSActivity.Input> launcher;
    public DownloadJSInterface(AppCompatActivity activity) {
        this.downloadActivity = new DownloadJSActivity(activity);
        this.launcher = activity.registerForActivityResult(this.downloadActivity,
                new ActivityResultCallback<Boolean>() {
                    @Override
                    public void onActivityResult(Boolean result) {
                        Logger.debug("Activity result ->>>>", String.valueOf(result));
                    }
                });
    }

    @JavascriptInterface
    public void receiveStreamChunkFromJavascript(String chunk, String operationID) {
//        //Runtime External storage permission for saving download files
//        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
//            if (this.activity.checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED) {
//                Logger.debug("permission", "permission denied to WRITE_EXTERNAL_STORAGE - requesting it");
//                String[] permissions = {Manifest.permission.WRITE_EXTERNAL_STORAGE};
//                this.activity.requestPermissions(permissions, 1);
//            }
//        }
//        //
//        try {
//            FileOutputStream fOut = new FileOutputStream(getDownloadFilePath(nativeFileURL) + ".mp4", true);
//            OutputStreamWriter osw = new OutputStreamWriter(fOut, "UTF-8");
//            osw.write(chunk);
//            osw.flush();
//            osw.close();
//        } catch (IOException e) {
//            Logger.error("Exception while appending to download file:", e);
//        }
        Logger.debug("Received stream", chunk);
        Logger.debug("Received stream2", operationID);
        this.downloadActivity.appendToOperation(operationID, chunk);
    }
    @JavascriptInterface
    public void receiveStreamErrorFromJavascript(String error, String operationID) {
        Logger.debug("Received error", error + " - " + operationID);
        this.downloadActivity.failOperation(operationID);
    }
    @JavascriptInterface
    public void receiveStreamCompletionFromJavascript(String operationID) {
        Logger.debug("Operation completed", operationID);
        this.downloadActivity.completeOperation(operationID);
    }

    /* Proxy injector
     *  This code analyze incoming download requests and return appropriated JS injectors.
     *  Injectors, handle the download request at the browser context and call the JSInterface
     *  with chunks of data to be written on the disk. This technic is specially useful for
     *  blobs and webworker initiated downloads.
     */
    public String getJavascriptBridgeForURL(String fileURL, String contentDisposition, String mimeType) {
        if (fileURL.startsWith("http://") || fileURL.startsWith("https://") || fileURL.startsWith("blob:")) {
            //
            String operationID = UUID.randomUUID().toString();
            DownloadJSActivity.Input input = new DownloadJSActivity.Input(operationID, fileURL, mimeType, contentDisposition);
            this.launcher.launch(input);
            //
            if (mimeType != null && mimeType.indexOf("application/octet-stream") != -1) {
                return this.getJavascriptBridgeForReadyAvailableData(fileURL, mimeType, operationID);
            } else { //might already have ready-available data
                return this.getJavascriptBridgeForReadyAvailableData(fileURL, mimeType, operationID);
            }

        }
        return null;
    }
    /* Injectors */
    private String getJavascriptBridgeForStreamData(String streamURL) {
        return "javascript: " +
                " " +
                "fetch('" + streamURL + "', { method: 'GET' }).then((res) => {\n" +
                "              console.log(res.status);\n" +
                "              res.text().then((text) => { console.log(text) })\n" +
                "            });";
    }
    private String getJavascriptBridgeForReadyAvailableData(String blobUrl, String mimeType, String operationID) {
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
                "            offset += evt.target.result.byteLength;" +
                "            chunkReadCallback((new TextDecoder('utf-8')).decode(evt.target.result));" +
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
                "xhr.open('GET', '"+ blobUrl +"', true);" +
                ((mimeType != null && mimeType.length() > 0) ? "xhr.setRequestHeader('Content-type','" + mimeType + "');" : "") +
                "xhr.responseType = 'blob';console.log('fetchingg');" +
                "xhr.onerror = xhr.onload = function(e) {console.log('fetched', this.status);" +
                "    if (this.status == 200) {" +
                "        var blob = this.response;" +
                "        parseFile(blob, " +
                "         function(chunk) { CapacitorDownloadInterface.receiveStreamChunkFromJavascript(chunk, '" + operationID + "'); }," +
                "         function(err) { console.error(err); CapacitorDownloadInterface.receiveStreamChunkFromJavascript(err.message, '" + operationID + "'); }, " +
                "         function() { console.log('capacitor bridge, drained!'); CapacitorDownloadInterface.receiveStreamCompletionFromJavascript('" + operationID + "'); } " +
                "        );" +
                "    } else {" +
                "         console.error('[Capacitor XHR] - error:', this.status, (e ? e.loaded : this.responseText));" +
                "    }" +
                "};" +
                "xhr.send();})()";
    }
}
