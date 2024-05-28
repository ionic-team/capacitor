package com.getcapacitor.cordova;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.android.R;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;

import java.util.List;

@CapacitorPlugin
public class CordovaPlugin extends Plugin {
    private MockCordovaInterfaceImpl cordovaInterface;

    @Override
    public void load() {
        ConfigXmlParser parser = new ConfigXmlParser();
        parser.parse(getActivity().getApplicationContext());
        CordovaPreferences preferences = parser.getPreferences();
        preferences.setPreferencesBundle(getActivity().getIntent().getExtras());
        List<PluginEntry> pluginEntries = parser.getPluginEntries();

        cordovaInterface = new MockCordovaInterfaceImpl(getActivity());

        MockCordovaWebViewImpl mockWebView = new MockCordovaWebViewImpl(getActivity().getApplicationContext());
        mockWebView.init(cordovaInterface, pluginEntries, preferences, bridge.getWebView());
        PluginManager pluginManager = mockWebView.getPluginManager();
        cordovaInterface.onCordovaInit(pluginManager);


        bridge.registerInterceptor("cordova", (postData) -> {
            String callbackId = postData.getString("callbackId");

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

            bridge.execute(
                    () -> {
                        pluginManager.exec(service, action, callbackId, actionArgs);
                    }
            );
        });
    }

    // TODO: How to we ensure this gets called? Should we punt and use reflection?
    @Override
    protected void restoreState(Bundle state) {
        if (state != null) {
            cordovaInterface.restoreInstanceState(state);
        }
    }
}
