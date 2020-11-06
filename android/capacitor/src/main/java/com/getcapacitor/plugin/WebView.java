package com.getcapacitor.plugin;

import android.app.Activity;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin
public class WebView extends Plugin {

    public static final String WEBVIEW_PREFS_NAME = "CapWebViewSettings";
    public static final String CAP_SERVER_PATH = "serverBasePath";

    @PluginMethod
    public void setServerBasePath(PluginCall call) {
        String path = call.getString("path");
        bridge.setServerBasePath(path);
        call.resolve();
    }

    @PluginMethod
    public void getServerBasePath(PluginCall call) {
        String path = bridge.getServerBasePath();
        JSObject ret = new JSObject();
        ret.put("path", path);
        call.resolve(ret);
    }

    @PluginMethod
    public void persistServerBasePath(PluginCall call) {
        String path = bridge.getServerBasePath();
        SharedPreferences prefs = getContext().getSharedPreferences(WEBVIEW_PREFS_NAME, Activity.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(CAP_SERVER_PATH, path);
        editor.apply();
        call.resolve();
    }
}
