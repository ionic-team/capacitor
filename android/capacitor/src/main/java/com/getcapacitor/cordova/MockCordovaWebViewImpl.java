package com.getcapacitor.cordova;

import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import java.util.List;
import java.util.Map;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaWebViewEngine;
import org.apache.cordova.ICordovaCookieManager;
import org.apache.cordova.NativeToJsMessageQueue;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.apache.cordova.PluginResult;

public class MockCordovaWebViewImpl implements CordovaWebView {

    private Context context;
    private PluginManager pluginManager;
    private CordovaPreferences preferences;
    private CordovaResourceApi resourceApi;
    private NativeToJsMessageQueue nativeToJsMessageQueue;
    private CordovaInterface cordova;
    private CapacitorCordovaCookieManager cookieManager;
    private WebView webView;
    private boolean hasPausedEver;

    public MockCordovaWebViewImpl(Context context) {
        this.context = context;
    }

    @Override
    public void init(CordovaInterface cordova, List<PluginEntry> pluginEntries, CordovaPreferences preferences) {
        this.cordova = cordova;
        this.preferences = preferences;
        this.pluginManager = new PluginManager(this, this.cordova, pluginEntries);
        this.resourceApi = new CordovaResourceApi(this.context, this.pluginManager);
        this.pluginManager.init();
    }

    public void init(CordovaInterface cordova, List<PluginEntry> pluginEntries, CordovaPreferences preferences, WebView webView) {
        this.cordova = cordova;
        this.webView = webView;
        this.preferences = preferences;
        this.pluginManager = new PluginManager(this, this.cordova, pluginEntries);
        this.resourceApi = new CordovaResourceApi(this.context, this.pluginManager);
        nativeToJsMessageQueue = new NativeToJsMessageQueue();
        nativeToJsMessageQueue.addBridgeMode(new CapacitorEvalBridgeMode(webView, this.cordova));
        nativeToJsMessageQueue.setBridgeMode(0);
        this.cookieManager = new CapacitorCordovaCookieManager(webView);
        this.pluginManager.init();
    }

    public static class CapacitorEvalBridgeMode extends NativeToJsMessageQueue.BridgeMode {

        private final WebView webView;
        private final CordovaInterface cordova;

        public CapacitorEvalBridgeMode(WebView webView, CordovaInterface cordova) {
            this.webView = webView;
            this.cordova = cordova;
        }

        @Override
        public void onNativeToJsMessageAvailable(final NativeToJsMessageQueue queue) {
            cordova
                .getActivity()
                .runOnUiThread(() -> {
                    String js = queue.popAndEncodeAsJs();
                    if (js != null) {
                        webView.evaluateJavascript(js, null);
                    }
                });
        }
    }

    @Override
    public boolean isInitialized() {
        return cordova != null;
    }

    @Override
    public View getView() {
        return this.webView;
    }

    @Override
    public void loadUrlIntoView(String url, boolean recreatePlugins) {
        if (url.equals("about:blank") || url.startsWith("javascript:")) {
            webView.loadUrl(url);
            return;
        }
    }

    @Override
    public void stopLoading() {}

    @Override
    public boolean canGoBack() {
        return false;
    }

    @Override
    public void clearCache() {}

    @Deprecated
    @Override
    public void clearCache(boolean b) {}

    @Override
    public void clearHistory() {}

    @Override
    public boolean backHistory() {
        return false;
    }

    @Override
    public void handlePause(boolean keepRunning) {
        if (!isInitialized()) {
            return;
        }
        hasPausedEver = true;
        pluginManager.onPause(keepRunning);
        triggerDocumentEvent("pause");
        // If app doesn't want to run in background
        if (!keepRunning) {
            // Pause JavaScript timers. This affects all webviews within the app!
            this.setPaused(true);
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        if (this.pluginManager != null) {
            this.pluginManager.onNewIntent(intent);
        }
    }

    @Override
    public void handleResume(boolean keepRunning) {
        if (!isInitialized()) {
            return;
        }
        this.setPaused(false);
        this.pluginManager.onResume(keepRunning);
        if (hasPausedEver) {
            triggerDocumentEvent("resume");
        }
    }

    @Override
    public void handleStart() {
        if (!isInitialized()) {
            return;
        }
        pluginManager.onStart();
    }

    @Override
    public void handleStop() {
        if (!isInitialized()) {
            return;
        }
        pluginManager.onStop();
    }

    @Override
    public void handleDestroy() {
        if (!isInitialized()) {
            return;
        }
        this.pluginManager.onDestroy();
    }

    @Deprecated
    @Override
    public void sendJavascript(String statememt) {
        nativeToJsMessageQueue.addJavaScript(statememt);
    }

    public void eval(final String js, final ValueCallback<String> callback) {
        Handler mainHandler = new Handler(context.getMainLooper());
        mainHandler.post(() -> webView.evaluateJavascript(js, callback));
    }

    public void triggerDocumentEvent(final String eventName) {
        eval("window.Capacitor.triggerEvent('" + eventName + "', 'document');", s -> {});
    }

    @Override
    public void showWebPage(String url, boolean openExternal, boolean clearHistory, Map<String, Object> params) {}

    @Deprecated
    @Override
    public boolean isCustomViewShowing() {
        return false;
    }

    @Deprecated
    @Override
    public void showCustomView(View view, WebChromeClient.CustomViewCallback callback) {}

    @Deprecated
    @Override
    public void hideCustomView() {}

    @Override
    public CordovaResourceApi getResourceApi() {
        return this.resourceApi;
    }

    @Override
    public void setButtonPlumbedToJs(int keyCode, boolean override) {}

    @Override
    public boolean isButtonPlumbedToJs(int keyCode) {
        return false;
    }

    @Override
    public void sendPluginResult(PluginResult cr, String callbackId) {
        nativeToJsMessageQueue.addPluginResult(cr, callbackId);
    }

    @Override
    public PluginManager getPluginManager() {
        return this.pluginManager;
    }

    @Override
    public CordovaWebViewEngine getEngine() {
        return null;
    }

    @Override
    public CordovaPreferences getPreferences() {
        return this.preferences;
    }

    @Override
    public ICordovaCookieManager getCookieManager() {
        return cookieManager;
    }

    @Override
    public String getUrl() {
        return webView.getUrl();
    }

    @Override
    public Context getContext() {
        return this.webView.getContext();
    }

    @Override
    public void loadUrl(String url) {
        loadUrlIntoView(url, true);
    }

    @Override
    public Object postMessage(String id, Object data) {
        return pluginManager.postMessage(id, data);
    }

    public void setPaused(boolean value) {
        if (value) {
            webView.onPause();
            webView.pauseTimers();
        } else {
            webView.onResume();
            webView.resumeTimers();
        }
    }
}
