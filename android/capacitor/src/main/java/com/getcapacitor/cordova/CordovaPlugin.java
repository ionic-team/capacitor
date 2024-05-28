package com.getcapacitor.cordova;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.android.R;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.json.JSONException;

import java.util.List;

@CapacitorPlugin(name = "__CordovaPlugin")
public class CordovaPlugin extends Plugin {
    private MockCordovaInterfaceImpl cordovaInterface;
    private CordovaWebView webView;
    private CordovaPreferences preferences;

    private boolean pluginHadActivityResult = false;
    private boolean pluginHadPermissionResult = false;

    @Override
    public void load() {
        ConfigXmlParser parser = new ConfigXmlParser();
        parser.parse(getActivity().getApplicationContext());
        preferences = parser.getPreferences();
        preferences.setPreferencesBundle(getActivity().getIntent().getExtras());
        List<PluginEntry> pluginEntries = parser.getPluginEntries();

        cordovaInterface = new MockCordovaInterfaceImpl(getActivity());

        MockCordovaWebViewImpl mockWebView = new MockCordovaWebViewImpl(getActivity().getApplicationContext());
        mockWebView.init(cordovaInterface, pluginEntries, preferences, bridge.getWebView());
        webView = mockWebView;
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


    @Override
    protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        try {
            pluginHadPermissionResult = cordovaInterface.handlePermissionResult(requestCode, permissions, grantResults);
        } catch (JSONException e) {
            Logger.debug("Error on Cordova plugin permissions request " + e.getMessage());
        }
    }

    @Override
    public boolean hasPermission(String permission) {
        if (permission.equals("DisableDeploy")) {
            return preferences.getBoolean(permission, false);
        }

        if (permission.equals("KeepRunning")) {
            return preferences.getBoolean(permission, true);
        }

        return false;
    }

    @Override
    public boolean hasDefinedRequiredPermissions() {
        boolean currentPermissionResult = pluginHadPermissionResult;
        pluginHadPermissionResult = false;
        return currentPermissionResult;
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        pluginHadActivityResult = cordovaInterface.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public boolean hasRequiredPermissions() {
        boolean currentActivityResult = pluginHadActivityResult;
        pluginHadActivityResult = false;
        return currentActivityResult;
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        webView.onNewIntent(intent);
    }

    @Override
    protected void handleOnStart() {
        webView.handleStart();
    }

    @Override
    protected void handleOnResume() {
       webView.handleResume(bridge.shouldKeepRunning());
    }

    @Override
    protected void handleOnPause() {
        boolean keepRunning = bridge.shouldKeepRunning() || cordovaInterface.getActivityResultCallback() != null;
        webView.handlePause(keepRunning);
    }

    @Override
    protected void handleOnStop() {
        webView.handleStop();
    }

    @Override
    protected void handleOnDestroy() {
       webView.handleDestroy();
    }


}
