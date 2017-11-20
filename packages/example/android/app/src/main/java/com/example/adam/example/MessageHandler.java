package com.example.adam.example;

import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import org.json.JSONObject;
import java.lang.reflect.Method;


public class MessageHandler {
    private Avocado avocado;
    private WebView webView;


    public MessageHandler(Avocado avocado, WebView webView) {
        this.avocado = avocado;
        this.webView = webView;

        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.addJavascriptInterface(this, "avocadoAndroid");
    }

    @JavascriptInterface
    public void postMessage(String jsonStr) {
        try {
            JSONObject postData = new JSONObject(jsonStr);
            int callbackId = postData.getInt("callbackId");
            String pluginId = postData.getString("pluginId");
            String methodName = postData.getString("methodName");
            JSONObject methodData = postData.getJSONObject("data");

            Log.d("postMessage","callback: " + callbackId + ", pluginId: " + pluginId + ", methodName: " + methodName + ", methodData: " + methodData.toString());

            this.callPluginMethod(callbackId, pluginId, methodName, methodData);

        } catch (Exception ex) {
            Log.e("postMessage","error : " + ex);
        }
    }

    void callPluginMethod(int callbackId, String pluginId, String methodName, JSONObject methodData) {
        PluginCall call = new PluginCall(this, callbackId, methodData);

        try {
            Plugin plugin = this.avocado.getPlugin(pluginId);
            if (plugin == null) {
                Log.e("callPluginMethod", "unable to find plugin : " + pluginId);
                call.errorCallback("unable to find plugin : " + pluginId);
                return;
            }

            Log.d("callPluginMethod","callback: " + callbackId + ", pluginId: " + plugin.getId() + ", className:" + plugin.getClass().getName() + ", methodName: " + methodName + ", methodData: " + methodData.toString());

            Method method = plugin.getClass().getMethod(methodName, PluginCall.class);

            method.invoke(plugin, call);

        } catch (Exception ex) {
            Log.e("callPluginMethod","error : " + ex);
            call.errorCallback(ex.toString());
        }
    }

    public void responseMessage(int callbackId, PluginResult successResult, PluginResult errorResult) {
        try {
            PluginResult data = new PluginResult();
            data.put("callbackId", callbackId);

            if (errorResult != null) {
                data.put("success", false);
                data.put("error", errorResult);
            } else {
                data.put("success", true);
                data.put("data", successResult);
            }

            final String runScript = "avocado.fromNative(" + data.toString() + ")";

            final WebView webView = this.webView;
            webView.post(new Runnable() {
                @Override
                public void run() {
                    webView.evaluateJavascript(runScript, null);
                }
            });

        } catch (Exception ex) {
            Log.e("responseMessage","error : " + ex);
        }
    }

}
