package com.getcapacitor;

import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;


/**
 * MessageHandler handles messages from the WebView, dispatching them
 * to plugins.
 */
public class MessageHandler {
  private Bridge bridge;
  private WebView webView;

  public MessageHandler(Bridge bridge, WebView webView) {
    this.bridge = bridge;
    this.webView = webView;

    webView.addJavascriptInterface(this, "androidBridge");
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
      String callbackId = postData.getString("callbackId");
      String pluginId = postData.getString("pluginId");
      String methodName = postData.getString("methodName");
      JSObject methodData = postData.getJSObject("options");

      Log.d(Bridge.TAG, "To native: " + callbackId + ", pluginId: " + pluginId +
          ", methodName: " + methodName);

      this.callPluginMethod(callbackId, pluginId, methodName, methodData);

    } catch (Exception ex) {
      Log.e(Bridge.TAG, "error : " + ex);
    }
  }

  private void callPluginMethod(String callbackId, String pluginId, String methodName, JSObject methodData) {
    PluginCall call = new PluginCall(this, pluginId, callbackId, methodName, methodData);

    bridge.callPluginMethod(pluginId, methodName, call);
  }

  public void sendResponseMessage(String callbackId, String pluginId, String methodName, PluginResult successResult, PluginResult errorResult) {
    try {
      PluginResult data = new PluginResult();
      data.put("callbackId", callbackId);
      data.put("pluginId", pluginId);
      data.put("methodName", methodName);

      if (errorResult != null) {
        data.put("success", false);
        data.put("error", errorResult);
        Log.d(Bridge.TAG, "Sending plugin error: " + data.toString());
      } else {
        data.put("success", true);
        data.put("data", successResult);
      }

      // Only eval the JS code if this is a valid callback id
      if (!callbackId.equals(PluginCall.CALLBACK_ID_DANGLING)) {
        final String runScript = "window.Capacitor.fromNative(" + data.toString() + ")";

        final WebView webView = this.webView;
        webView.post(new Runnable() {
          @Override
          public void run() {
            webView.evaluateJavascript(runScript, null);
          }
        });
      } else {
        bridge.storeDanglingPluginResult(data);
      }

    } catch (Exception ex) {
      Log.e(Bridge.TAG, "sendResponseMessage: error: " + ex);
    }
  }

}
