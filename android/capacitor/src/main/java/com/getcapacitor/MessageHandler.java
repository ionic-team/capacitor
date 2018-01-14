package com.getcapacitor;

import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;


/**
 * MessageHandler handles messages from the webview, dispatching them
 * to plugins.
 */
public class MessageHandler {
  private Bridge bridge;
  private WebView webView;


  public MessageHandler(Bridge capacitor, WebView webView) {
    this.bridge = capacitor;
    this.webView = webView;

    webView.addJavascriptInterface(this, "androidBridge");
  }

  @JavascriptInterface
  public void postMessageStr(String str) {
    Log.d(Bridge.TAG, "Post message: " + str);
  }

  @JavascriptInterface
  public void postMessage(String jsonStr) {
    try {
      Log.d(Bridge.TAG, jsonStr);

      JSObject postData = new JSObject(jsonStr);
      String callbackId = postData.getString("callbackId");
      String pluginId = postData.getString("pluginId");
      String methodName = postData.getString("methodName");
      JSObject methodData = postData.getJSObject("options");

      Log.d(Bridge.TAG, "callback: " + callbackId + ", pluginId: " + pluginId + ", methodName: " + methodName + ", methodData: " + methodData.toString());

      this.callPluginMethod(callbackId, pluginId, methodName, methodData);

    } catch (Exception ex) {
      Log.e(Bridge.TAG, "error : " + ex);
    }
  }

  void callPluginMethod(String callbackId, String pluginId, String methodName, JSObject methodData) {
    PluginCall call = new PluginCall(this, pluginId, callbackId, methodName, methodData);

    bridge.callPluginMethod(pluginId, methodName, call);
  }

  public void responseMessage(String callbackId, PluginResult successResult, PluginResult errorResult) {
    try {
      PluginResult data = new PluginResult();
      data.put("callbackId", callbackId);

      if (errorResult != null) {
        data.put("success", false);
        data.put("error", errorResult);
        Log.d(Bridge.TAG, "Sending plugin error: " + data.toString());
      } else {
        data.put("success", true);
        data.put("data", successResult);
      }

      final String runScript = "window.Capacitor.fromNative(" + data.toString() + ")";

      final WebView webView = this.webView;
      webView.post(new Runnable() {
        @Override
        public void run() {
          webView.evaluateJavascript(runScript, null);
        }
      });

    } catch (Exception ex) {
      Log.e(Bridge.TAG, "responseMessage: error: " + ex);
    }
  }

}
