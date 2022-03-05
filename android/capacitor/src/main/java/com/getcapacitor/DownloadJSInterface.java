package com.getcapacitor;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Environment;
import android.text.TextUtils;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
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
    private Context context;
    private AppCompatActivity activity;
    public DownloadJSInterface(Context context, AppCompatActivity activity) {
        this.context = context;
        this.activity = activity;
    }

    @JavascriptInterface
    public void receiveStreamChunkFromJavascript(String chunk, String nativeFileURL) {
        //Runtime External storage permission for saving download files
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            if (this.activity.checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED) {
                Logger.debug("permission", "permission denied to WRITE_EXTERNAL_STORAGE - requesting it");
                String[] permissions = {Manifest.permission.WRITE_EXTERNAL_STORAGE};
                this.activity.requestPermissions(permissions, 1);
            }
        }
        //
        try {
            FileOutputStream fOut = new FileOutputStream(getDownloadFilePath(nativeFileURL) + ".mp4", true);
            OutputStreamWriter osw = new OutputStreamWriter(fOut, "UTF-8");
            osw.write(chunk);
            osw.flush();
            osw.close();
        } catch (IOException e) {
            Logger.error("Exception while appending to download file:", e);
        }
        Logger.debug("Received stream", chunk);
        Logger.debug("Received stream2", nativeFileURL);
    }

    /* Proxy injector
     *  This code analyze incoming download requests and return appropriated JS injectors.
     *  Injectors, handle the download request at the browser context and call the JSInterface
     *  with chunks of data to be written on the disk. This technic is specially useful for
     *  blobs and webworker initiated downloads.
     */
    public static String getJavascriptBridgeForURL(String fileURL, String contentDisposition, String mimeType) {
        if (fileURL.startsWith("http://") || fileURL.startsWith("https://") || fileURL.startsWith("blob:")) {
            String fileName = getUniqueDownloadFileURL(fileURL, contentDisposition, mimeType, null);
            return getJavascriptBridgeForReadyAvailableData(fileURL, mimeType, fileName);
            // if (mimeType != null && mimeType.indexOf("application/octet-stream") != -1) {
            //     Logger.debug(getJavascriptBridgeForStreamData(fileURL));
            //     return getJavascriptBridgeForReadyAvailableData(fileURL, mimeType, fileName);
            // } else { //might already have ready-available data
                
            // }

        }
        return null;
    }
    /* Injectors */
    // private static String getJavascriptBridgeForStreamData(String streamURL) {
    //     return "javascript: " +
    //             " " +
    //             "fetch('" + streamURL + "', { method: 'GET' }).then((res) => {\n" +
    //             "              console.log(res.status);\n" +
    //             "              res.text().then((text) => { console.log(text) })\n" +
    //             "            });";
    // }
    private static String getJavascriptBridgeForReadyAvailableData(String blobUrl, String mimeType, String nativeFileURL) {
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
                "         function(chunk) { CapacitorDownloadInterface.receiveStreamChunkFromJavascript(chunk, '" + nativeFileURL + "'); }," +
                "         function(err) { console.error(err); }, " +
                "         function() { console.log('capacitor bridge, drained!'); } " +
                "        );" +
                "    } else {" +
                "         console.error('[Capacitor XHR] - error:', this.status, (e ? e.loaded : this.responseText));" +
                "    }" +
                "};" +
                "xhr.send();})()";
    }
    /* Utils */
    public static String getDownloadFilePath(String fileName) {
        return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() + '/' + fileName;
    }
    private static String getUniqueDownloadFileURL(String fileDownloadURL, String optionalCD, String optionalMimeType, String optionalSuffix) {
        String suggestedFilename = URLUtil.guessFileName(fileDownloadURL, optionalCD, optionalMimeType);
        ArrayList<String> fileComps = new ArrayList<String>(Arrays.asList(suggestedFilename.split(".")));
        String fileName = "";
        //
        if (fileComps.size() > 1) {
            String fileExtension = "." + fileComps.remove(fileComps.size() - 1);
            fileName = TextUtils.join(".", fileComps) + (optionalSuffix != null ? optionalSuffix : "") + fileExtension;
        } else {
            fileName = suggestedFilename + (optionalSuffix != null ? optionalSuffix : "");
        }
        //Check if file with generated name exists
        File file = new File(getDownloadFilePath(fileName));
        if (file.exists()) {
            String randString = UUID.randomUUID().toString();
            return getUniqueDownloadFileURL(fileDownloadURL, optionalCD, optionalMimeType, randString);
        }
        return fileName;
    }
}
