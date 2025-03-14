package com.getcapacitor;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.getcapacitor.android.R;
import java.util.ArrayList;
import java.util.List;

public class BridgeActivity extends AppCompatActivity {

    protected Bridge bridge;
    protected boolean keepRunning = true;
    protected CapConfig config;

    protected int activityDepth = 0;
    protected List<Class<? extends Plugin>> initialPlugins = new ArrayList<>();
    protected final Bridge.Builder bridgeBuilder = new Bridge.Builder(this);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        bridgeBuilder.setInstanceState(savedInstanceState);
        getApplication().setTheme(R.style.AppTheme_NoActionBar);
        setTheme(R.style.AppTheme_NoActionBar);
        try {
            setContentView(R.layout.capacitor_bridge_layout_main);
        } catch (Exception ex) {
            setContentView(R.layout.no_webview);
            return;
        }

        PluginManager loader = new PluginManager(getAssets());

        try {
            bridgeBuilder.addPlugins(loader.loadPluginClasses());
        } catch (PluginLoadException ex) {
            Logger.error("Error loading plugins.", ex);
        }

        this.load();
    }

    protected void load() {
        Logger.debug("Starting BridgeActivity");

        bridge = bridgeBuilder.addPlugins(initialPlugins).setConfig(config).create();

        this.keepRunning = bridge.shouldKeepRunning();
        this.onNewIntent(getIntent());
    }

    public void registerPlugin(Class<? extends Plugin> plugin) {
        bridgeBuilder.addPlugin(plugin);
    }

    public void registerPlugins(List<Class<? extends Plugin>> plugins) {
        bridgeBuilder.addPlugins(plugins);
    }

    public Bridge getBridge() {
        return this.bridge;
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        bridge.saveInstanceState(outState);
    }

    @Override
    public void onStart() {
        super.onStart();
        activityDepth++;
        if (this.bridge != null) {
            this.bridge.onStart();
            Logger.debug("App started");
        }
    }

    @Override
    public void onRestart() {
        super.onRestart();
        this.bridge.onRestart();
        Logger.debug("App restarted");
    }

    @Override
    public void onResume() {
        super.onResume();
        if (bridge != null) {
            bridge.getApp().fireStatusChange(true);
            this.bridge.onResume();
            Logger.debug("App resumed");
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (bridge != null) {
            this.bridge.onPause();
            Logger.debug("App paused");
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        if (bridge != null) {
            activityDepth = Math.max(0, activityDepth - 1);
            if (activityDepth == 0) {
                bridge.getApp().fireStatusChange(false);
            }

            this.bridge.onStop();
            Logger.debug("App stopped");
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (this.bridge != null) {
            this.bridge.onDestroy();
            Logger.debug("App destroyed");
        }
    }

    @Override
    public void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        this.bridge.onDetachedFromWindow();
    }

    /**
     * Handles permission request results.
     *
     * Capacitor is backwards compatible such that plugins using legacy permission request codes
     * may coexist with plugins using the AndroidX Activity v1.2 permission callback flow introduced
     * in Capacitor 3.0.
     *
     * In this method, plugins are checked first for ownership of the legacy permission request code.
     * If the {@link Bridge#onRequestPermissionsResult(int, String[], int[])} method indicates it has
     * handled the permission, then the permission callback will be considered complete. Otherwise,
     * the permission will be handled using the AndroidX Activity flow.
     *
     * @param requestCode the request code associated with the permission request
     * @param permissions the Android permission strings requested
     * @param grantResults the status result of the permission request
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (this.bridge == null) {
            return;
        }

        if (!bridge.onRequestPermissionsResult(requestCode, permissions, grantResults)) {
            super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        }
    }

    /**
     * Handles activity results.
     *
     * Capacitor is backwards compatible such that plugins using legacy activity result codes
     * may coexist with plugins using the AndroidX Activity v1.2 activity callback flow introduced
     * in Capacitor 3.0.
     *
     * In this method, plugins are checked first for ownership of the legacy request code. If the
     * {@link Bridge#onActivityResult(int, int, Intent)} method indicates it has handled the activity
     * result, then the callback will be considered complete. Otherwise, the result will be handled
     * using the AndroidX Activiy flow.
     *
     * @param requestCode the request code associated with the activity result
     * @param resultCode the result code
     * @param data any data included with the activity result
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (this.bridge == null) {
            return;
        }

        if (!bridge.onActivityResult(requestCode, resultCode, data)) {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        if (this.bridge == null || intent == null) {
            return;
        }

        this.bridge.onNewIntent(intent);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        if (this.bridge == null) {
            return;
        }

        this.bridge.onConfigurationChanged(newConfig);
    }
}
