package com.getcapacitor;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import java.util.function.Function;
//import org.apache.cordova.PluginManager;

/**
 * MessageHandler handles messages from the WebView, dispatching them
 * to plugins.
 */
public class MessageHandler {
    @FunctionalInterface
    public interface Interceptor {
        void intercept(JSObject object);
    }


    private Bridge bridge;
    private WebView webView;
//    private PluginManager cordovaPluginManager;
    private JavaScriptReplyProxy javaScriptReplyProxy;


    public MessageHandler(Bridge bridge, WebView webView) {
        this.bridge = bridge;
        this.webView = webView;

        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER) && !bridge.getConfig().isUsingLegacyBridge()) {
            WebViewCompat.WebMessageListener capListener = (view, message, sourceOrigin, isMainFrame, replyProxy) -> {
                if (isMainFrame) {
                    postMessage(message.getData());
                    javaScriptReplyProxy = replyProxy;
                } else {
                    Logger.warn("Plugin execution is allowed in Main Frame only");
                }
            };
            try {
                WebViewCompat.addWebMessageListener(webView, "androidBridge", bridge.getAllowedOriginRules(), capListener);
            } catch (Exception ex) {
                webView.addJavascriptInterface(this, "androidBridge");
            }
        } else {
            webView.addJavascriptInterface(this, "androidBridge");
        }
    }

    @Deprecated
    public MessageHandler(Bridge bridge, WebView webView, Object cordovaPluginManager) {
        this(bridge, webView);
    }

    /**
     * The main message handler that will be called from JavaScript
     * to send a message to the native bridge.
     * @param jsonStr
     */
    @JavascriptInterface
    @SuppressWarnings("unused")
    public void postMessage(String jsonStr) {
        try {
            JSObject postData = new JSObject(jsonStr);

            String type = postData.getString("type");

//            boolean typeIsNotNull = type != null;
            if (type == null)
                type = "message";

            Interceptor interceptor = bridge.getCallInterceptor(type);
            if (interceptor != null) {
                interceptor.intercept(postData);
            }
        } catch (Exception ex) {
            Logger.error("Post message error:", ex);
        }
    }

    public void sendResponseMessage(PluginCall call, PluginResult successResult, PluginResult errorResult) {
        try {
            PluginResult data = new PluginResult();
            data.put("save", call.isKeptAlive());
            data.put("callbackId", call.getCallbackId());
            data.put("pluginId", call.getPluginId());
            data.put("methodName", call.getMethodName());

            boolean pluginResultInError = errorResult != null;
            if (pluginResultInError) {
                data.put("success", false);
                data.put("error", errorResult);
                Logger.debug("Sending plugin error: " + data.toString());
            } else {
                data.put("success", true);
                if (successResult != null) {
                    data.put("data", successResult);
                }
            }

            boolean isValidCallbackId = !call.getCallbackId().equals(PluginCall.CALLBACK_ID_DANGLING);
            if (isValidCallbackId) {
                if (bridge.getConfig().isUsingLegacyBridge()) {
                    legacySendResponseMessage(data);
                } else if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER) && javaScriptReplyProxy != null) {
                    javaScriptReplyProxy.postMessage(data.toString());
                } else {
                    legacySendResponseMessage(data);
                }
            } else {
                bridge.getApp().fireRestoredResult(data);
            }
        } catch (Exception ex) {
            Logger.error("sendResponseMessage: error: " + ex);
        }
        if (!call.isKeptAlive()) {
            call.release(bridge);
        }
    }

    private void legacySendResponseMessage(PluginResult data) {
        final String runScript = "window.Capacitor.fromNative(" + data.toString() + ")";
        final WebView webView = this.webView;
        webView.post(() -> webView.evaluateJavascript(runScript, null));
    }

    private void callPluginMethod(String callbackId, String pluginId, String methodName, JSObject methodData) {
        PluginCall call = new PluginCall(this, pluginId, callbackId, methodName, methodData);
        bridge.callPluginMethod(pluginId, methodName, call);
    }

//    private void callCordovaPluginMethod(String callbackId, String service, String action, String actionArgs) {
//        bridge.execute(
//            () -> {
//                cordovaPluginManager.exec(service, action, callbackId, actionArgs);
//            }
//        );
//    }
}
