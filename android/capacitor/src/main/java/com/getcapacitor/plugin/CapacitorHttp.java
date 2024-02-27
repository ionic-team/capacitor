package com.getcapacitor.plugin;

import android.Manifest;
import android.webkit.JavascriptInterface;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginConfig;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.plugin.util.CapacitorHttpUrlConnection;
import com.getcapacitor.plugin.util.HttpRequestHandler;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(
    permissions = {
        @Permission(strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "HttpWrite"),
        @Permission(strings = { Manifest.permission.READ_EXTERNAL_STORAGE }, alias = "HttpRead")
    }
)
public class CapacitorHttp extends Plugin {

    private final Map<Runnable, PluginCall> activeRequests = new HashMap<>();
    private final ExecutorService executor = Executors.newCachedThreadPool();

    @Override
    public void load() {
        this.bridge.getWebView().addJavascriptInterface(this, "CapacitorHttpAndroidInterface");
        super.load();
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();

        for (Map.Entry<Runnable, PluginCall> entry : activeRequests.entrySet()) {
            Runnable job = entry.getKey();
            PluginCall call = entry.getValue();

            if (call.getData().has("activeCapacitorHttpUrlConnection")) {
                try {
                    CapacitorHttpUrlConnection connection = (CapacitorHttpUrlConnection) call
                        .getData()
                        .get("activeCapacitorHttpUrlConnection");
                    connection.disconnect();
                    call.getData().remove("activeCapacitorHttpUrlConnection");
                } catch (Exception ignored) {}
            }

            getBridge().releaseCall(call);
        }

        activeRequests.clear();
        executor.shutdownNow();
    }

    private void http(final PluginCall call, final String httpMethod) {
        Runnable asyncHttpCall = new Runnable() {
            @Override
            public void run() {
                try {
                    JSObject response = HttpRequestHandler.request(call, httpMethod, getBridge());
                    call.resolve(response);
                } catch (Exception e) {
                    call.reject(e.getLocalizedMessage(), e.getClass().getSimpleName(), e);
                } finally {
                    activeRequests.remove(this);
                }
            }
        };

        if (!executor.isShutdown()) {
            activeRequests.put(asyncHttpCall, call);
            executor.submit(asyncHttpCall);
        } else {
            call.reject("Failed to execute request - Http Plugin was shutdown");
        }
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
