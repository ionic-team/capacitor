package com.getcapacitor;

import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;
import org.apache.cordova.PluginManager;

/**
 * MessageHandler handles messages from the WebView, dispatching them
 * to plugins.
 */
public class MessageHandler {

    private Bridge bridge;
    private WebView webView;
    private PluginManager cordovaPluginManager;
    private JavaScriptReplyProxy javaScriptReplyProxy;
    private final boolean scopedWebMessages;

    public static final class WebMessagePolicy {

        private final Set<String> originRules;
        private final Predicate<Uri> acceptsOrigin;

        public WebMessagePolicy(Set<String> originRules, Predicate<Uri> acceptsOrigin) {
            this.originRules = Collections.unmodifiableSet(new LinkedHashSet<>(Objects.requireNonNull(originRules)));
            this.acceptsOrigin = Objects.requireNonNull(acceptsOrigin);
        }

        public Set<String> originRules() {
            return originRules;
        }

        public Predicate<Uri> acceptsOrigin() {
            return acceptsOrigin;
        }
    }

    public MessageHandler(Bridge bridge, WebView webView, PluginManager cordovaPluginManager) {
        this(bridge, webView, cordovaPluginManager, null);
    }

    MessageHandler(Bridge bridge, WebView webView, PluginManager cordovaPluginManager, WebMessagePolicy policy) {
        this.bridge = bridge;
        this.webView = webView;
        this.cordovaPluginManager = cordovaPluginManager;
        this.scopedWebMessages = policy != null;

        Set<String> originRules = scopedWebMessages ? policy.originRules() : bridge.getAllowedOriginRules();
        if (scopedWebMessages && originRules.isEmpty()) {
            return;
        }

        if (
            WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER) &&
            (scopedWebMessages || !bridge.getConfig().isUsingLegacyBridge())
        ) {
            WebViewCompat.WebMessageListener capListener = (view, message, sourceOrigin, isMainFrame, replyProxy) -> {
                if (!isMainFrame) {
                    Logger.warn("Plugin execution is allowed in Main Frame only");
                    return;
                }
                if (!scopedWebMessages || (sourceOrigin != null && policy.acceptsOrigin().test(sourceOrigin))) {
                    javaScriptReplyProxy = replyProxy;
                    postMessage(message.getData());
                }
            };
            try {
                WebViewCompat.addWebMessageListener(webView, "androidBridge", originRules, capListener);
                return;
            } catch (Exception ex) {
                if (scopedWebMessages) {
                    Logger.error("Unable to register scoped Android bridge", ex);
                    return;
                }
            }
        }

        // The legacy interface has no way to identify the caller's frame or origin.
        if (scopedWebMessages) {
            Logger.warn("Scoped Android bridge unavailable on this WebView");
        } else {
            webView.addJavascriptInterface(this, "androidBridge");
        }
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

            boolean typeIsNotNull = type != null;
            boolean isCordovaPlugin = typeIsNotNull && type.equals("cordova");
            boolean isJavaScriptError = typeIsNotNull && type.equals("js.error");

            String callbackId = postData.getString("callbackId");

            if (isCordovaPlugin) {
                String service = postData.getString("service");
                String action = postData.getString("action");
                String actionArgs = postData.getString("actionArgs");

                Logger.verbose(
                    Logger.tags("Plugin"),
                    "To native (Cordova plugin): callbackId: " +
                        callbackId +
                        ", service: " +
                        service +
                        ", action: " +
                        action +
                        ", actionArgs: " +
                        actionArgs
                );

                this.callCordovaPluginMethod(callbackId, service, action, actionArgs);
            } else if (isJavaScriptError) {
                Logger.error("JavaScript Error: " + jsonStr);
            } else {
                String pluginId = postData.getString("pluginId");
                String methodName = postData.getString("methodName");
                JSObject methodData = postData.getJSObject("options", new JSObject());

                Logger.verbose(
                    Logger.tags("Plugin"),
                    "To native (Capacitor plugin): callbackId: " + callbackId + ", pluginId: " + pluginId + ", methodName: " + methodName
                );

                this.callPluginMethod(callbackId, pluginId, methodName, methodData);
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
                if (!scopedWebMessages && bridge.getConfig().isUsingLegacyBridge()) {
                    legacySendResponseMessage(data);
                } else if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER) && javaScriptReplyProxy != null) {
                    javaScriptReplyProxy.postMessage(data.toString());
                } else if (!scopedWebMessages) {
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

    private void callCordovaPluginMethod(String callbackId, String service, String action, String actionArgs) {
        bridge.execute(() -> {
            cordovaPluginManager.exec(service, action, callbackId, actionArgs);
        });
    }
}
