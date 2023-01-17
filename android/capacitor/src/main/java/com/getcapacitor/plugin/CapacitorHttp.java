package com.getcapacitor.plugin;

import android.Manifest;
import android.webkit.JavascriptInterface;
import com.getcapacitor.CapConfig;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginConfig;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.plugin.util.HttpRequestHandler;

@CapacitorPlugin(
    permissions = {
        @Permission(strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "HttpWrite"),
        @Permission(strings = { Manifest.permission.READ_EXTERNAL_STORAGE }, alias = "HttpRead")
    }
)
public class CapacitorHttp extends Plugin {

    @Override
    public void load() {
        this.bridge.getWebView().addJavascriptInterface(this, "CapacitorHttpAndroidInterface");
        super.load();
    }

    private void http(final PluginCall call, final String httpMethod) {
        Runnable asyncHttpCall = new Runnable() {
            @Override
            public void run() {
                try {
                    JSObject response = HttpRequestHandler.request(call, httpMethod);
                    call.resolve(response);
                } catch (Exception e) {
                    call.reject(e.getLocalizedMessage(), e.getClass().getSimpleName(), e);
                }
            }
        };
        Thread httpThread = new Thread(asyncHttpCall);
        httpThread.start();
    }

    @JavascriptInterface
    public boolean isEnabled() {
        PluginConfig pluginConfig = getBridge().getConfig().getPluginConfiguration("CapacitorHttp");
        return pluginConfig.getBoolean("enabled", false);
    }

    @PluginMethod
    public void request(final PluginCall call) {
        this.http(call, null);
    }

    @PluginMethod
    public void get(final PluginCall call) {
        this.http(call, "GET");
    }

    @PluginMethod
    public void post(final PluginCall call) {
        this.http(call, "POST");
    }

    @PluginMethod
    public void put(final PluginCall call) {
        this.http(call, "PUT");
    }

    @PluginMethod
    public void patch(final PluginCall call) {
        this.http(call, "PATCH");
    }

    @PluginMethod
    public void delete(final PluginCall call) {
        this.http(call, "DELETE");
    }
}
