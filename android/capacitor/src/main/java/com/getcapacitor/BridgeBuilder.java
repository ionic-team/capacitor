package com.getcapacitor;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.android.R;
import com.getcapacitor.cordova.MockCordovaInterfaceImpl;
import com.getcapacitor.cordova.MockCordovaWebViewImpl;
import java.util.ArrayList;
import java.util.List;
import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.json.JSONObject;

public class BridgeBuilder {

    private final Activity activity;
    private final Context context;
    private final WebView webView;

    private Bundle instanceState = null;
    private JSONObject config = new JSONObject();
    private List<Class<? extends Plugin>> plugins = new ArrayList<>();

    public static BridgeBuilder newInstance(Activity activity) {
        return new BridgeBuilder(activity);
    }

    protected BridgeBuilder(Activity activity) {
        this.activity = activity;
        this.context = activity.getApplicationContext();
        this.webView = activity.findViewById(R.id.webview);
    }

    public BridgeBuilder setInstanceState(Bundle instanceState) {
        this.instanceState = instanceState;
        return this;
    }

    public BridgeBuilder setConfig(JSONObject config) {
        this.config = config;
        return this;
    }

    public BridgeBuilder setPlugins(List<Class<? extends Plugin>> plugins) {
        this.plugins = plugins;
        return this;
    }

    public BridgeBuilder addPlugin(Class<? extends Plugin> plugin) {
        this.plugins.add(plugin);
        return this;
    }

    public Bridge build() {
        // Cordova initialization
        ConfigXmlParser parser = new ConfigXmlParser();
        parser.parse(context);
        CordovaPreferences preferences = parser.getPreferences();
        preferences.setPreferencesBundle(activity.getIntent().getExtras());
        List<PluginEntry> pluginEntries = parser.getPluginEntries();
        MockCordovaInterfaceImpl cordovaInterface = new MockCordovaInterfaceImpl(activity);
        if (instanceState != null) {
            cordovaInterface.restoreInstanceState(instanceState);
        }
        MockCordovaWebViewImpl mockWebView = new MockCordovaWebViewImpl(context);
        mockWebView.init(cordovaInterface, pluginEntries, preferences, webView);
        PluginManager pluginManager = mockWebView.getPluginManager();
        cordovaInterface.onCordovaInit(pluginManager);

        // Bridge initialization
        Bridge bridge = new Bridge(activity, webView, plugins, cordovaInterface, pluginManager, preferences, config);
        bridge.setCordovaWebView(mockWebView);

        if (instanceState != null) {
            bridge.restoreInstanceState(instanceState);
        }

        return bridge;
    }
}
