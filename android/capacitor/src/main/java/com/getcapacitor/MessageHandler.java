package com.getcapacitor;

import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.apache.cordova.PluginManager;

/**
 * MessageHandler handles messages from the WebView, dispatching them
 * to plugins.
 */
public class MessageHandler {
  private Bridge bridge;
  private WebView webView;
  private PluginManager cordovaPluginManager;

  public MessageHandler(Bridge bridge, WebView webView, PluginManager cordovaPluginManager) {
    this.bridge = bridge;
    this.webView = webView;
    this.cordovaPluginManager = cordovaPluginManager;

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

      String type = postData.getString("type");

      if (type != null && type.equals("cordova")) {
        String callbackId = postData.getString("callbackId");
        String service = postData.getString("service");
        String action = postData.getString("action");
        String actionArgs = postData.getString("actionArgs");
        Log.d(Bridge.TAG, "To native (Cordova): " + callbackId + ", service: " + service +
          ", action: " + action + ", actionArgs: " + actionArgs);
        this.callCordovaPluginMethod(callbackId, service, action, actionArgs);
      } else if (type != null && type.equals("js.error")) {
        Log.e(Bridge.TAG, "JavaScript Error: " + jsonStr);
      } else {
        String callbackId = postData.getString("callbackId");
        String pluginId = postData.getString("pluginId");
        String methodName = postData.getString("methodName");
        JSObject methodData = postData.getJSObject("options", new JSObject());
        if (!pluginId.equals("Console")) {
          Log.d(Bridge.TAG, "To native: " + callbackId + ", pluginId: " + pluginId +
              ", methodName: " + methodName);
        }
        this.callPluginMethod(callbackId, pluginId, methodName, methodData);
      }

    } catch (Exception ex) {
      Log.e(Bridge.TAG, "Post message error:", ex);
    }
  }

  private void callPluginMethod(String callbackId, String pluginId, String methodName, JSObject methodData) {
    PluginCall call = new PluginCall(this, pluginId, callbackId, methodName, methodData);

    bridge.callPluginMethod(pluginId, methodName, call);
  }

  private void callCordovaPluginMethod(String callbackId, String service, String action, String actionArgs){
    cordovaPluginManager.exec(service, action, callbackId, actionArgs);
  }

  public void sendResponseMessage(PluginCall call, PluginResult successResult, PluginResult errorResult) {
    try {
      PluginResult data = new PluginResult();
      data.put("save", call.isSaved());
      data.put("callbackId", call.getCallbackId());
      data.put("pluginId", call.getPluginId());
      data.put("methodName", call.getMethodName());

      if (errorResult != null) {
        data.put("success", false);
        data.put("error", errorResult);
        Log.d(Bridge.TAG, "Sending plugin error: " + data.toString());
      } else {
        data.put("success", true);
        data.put("data", successResult);
      }

      // Only eval the JS code if this is a valid callback id
      if (!call.getCallbackId().equals(PluginCall.CALLBACK_ID_DANGLING)) {
        final String runScript = "window.Capacitor.fromNative(" + data.toString() + ")";

        final WebView webView = this.webView;
        webView.post(new Runnable() {
          @Override
          public void run() {
            webView.evaluateJavascript(runScript, null);
          }
        });
      } else {
        bridge.storeDanglingPluginResult(call, data);
      }

    } catch (Exception ex) {
      Log.e(Bridge.TAG, "sendResponseMessage: error: " + ex);
    }
  }

}
