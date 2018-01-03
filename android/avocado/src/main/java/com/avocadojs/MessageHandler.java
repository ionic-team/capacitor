package com.avocadojs;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;


/**
 * MessageHandler handles messages from the webview, dispatching them
 * to plugins.
 */
public class MessageHandler {
  private Bridge bridge;
  private WebView webView;


  public MessageHandler(Bridge avocado, WebView webView) {
    this.bridge = avocado;
    this.webView = webView;

    webView.getSettings().setJavaScriptEnabled(true);
    webView.getSettings().setDomStorageEnabled(true);
    webView.addJavascriptInterface(this, "androidBridge");
  }

  @JavascriptInterface
  public void postMessageStr(String str) {
    Log.d("postMessageStr", str);
  }

  @JavascriptInterface
  public void postMessage(String jsonStr) {
    try {
      Log.d("postMessage", jsonStr);

      JSONObject postData = new JSONObject(jsonStr);
      String callbackId = postData.getString("callbackId");
      String pluginId = postData.getString("pluginId");
      String methodName = postData.getString("methodName");
      JSONObject methodData = postData.getJSONObject("options");

      Log.d("postMessage", "callback: " + callbackId + ", pluginId: " + pluginId + ", methodName: " + methodName + ", methodData: " + methodData.toString());

      this.callPluginMethod(callbackId, pluginId, methodName, methodData);

    } catch (Exception ex) {
      Log.e("postMessage", "error : " + ex);
    }
  }

  void callPluginMethod(String callbackId, String pluginId, String methodName, JSONObject methodData) {
    PluginCall call = new PluginCall(this, callbackId, methodData);

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

      final String runScript = "window.Avocado.fromNative(" + data.toString() + ")";

      final WebView webView = this.webView;
      webView.post(new Runnable() {
        @Override
        public void run() {
          webView.evaluateJavascript(runScript, null);
        }
      });

    } catch (Exception ex) {
      Log.e("responseMessage", "error : " + ex);
    }
  }

}
