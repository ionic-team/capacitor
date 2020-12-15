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
    private CapConfig config;

    private int activityDepth = 0;
    private List<Class<? extends Plugin>> initialPlugins = new ArrayList<>();
    private final Bridge.Builder bridgeBuilder = new Bridge.Builder();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        bridgeBuilder.setInstanceState(savedInstanceState);
    }

    /**
     * Initializes the Capacitor Bridge with the Activity.
     * @deprecated It is preferred not to call this method. If it is not called, the bridge is
     * initialized automatically. If you need to add additional plugins during initialization,
     * use {@link #registerPlugin(Class)} or {@link #registerPlugins(List)}.
     *
     * @param plugins A list of plugins to initialize with Capacitor
     */
    @Deprecated
    protected void init(Bundle savedInstanceState, List<Class<? extends Plugin>> plugins) {
        this.init(savedInstanceState, plugins, null);
    }

    /**
     * Initializes the Capacitor Bridge with the Activity.
     * @deprecated It is preferred not to call this method. If it is not called, the bridge is
     * initialized automatically. If you need to add additional plugins during initialization,
     * use {@link #registerPlugin(Class)} or {@link #registerPlugins(List)}.
     *
     * @param plugins A list of plugins to initialize with Capacitor
     * @param config An instance of a Capacitor Configuration to use. If null, will load from file
     */
    @Deprecated
    protected void init(Bundle savedInstanceState, List<Class<? extends Plugin>> plugins, CapConfig config) {
        this.initialPlugins = plugins;
        this.config = config;

        this.load();
    }

    /**
     * @deprecated This method should not be called manually.
     */
    @Deprecated
    protected void load(Bundle savedInstanceState) {
        this.load();
    }

    private void load() {
        getApplication().setTheme(getResources().getIdentifier("AppTheme_NoActionBar", "style", getPackageName()));
        setTheme(getResources().getIdentifier("AppTheme_NoActionBar", "style", getPackageName()));
        setTheme(R.style.AppTheme_NoActionBar);
        setContentView(R.layout.bridge_layout_main);

        Logger.debug("Starting BridgeActivity");

        bridge = bridgeBuilder.setActivity(this).addPlugins(initialPlugins).setConfig(config).create();

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

        // Preferred behavior: init() was not called, so we construct the bridge with auto-loaded plugins.
        if (bridge == null) {
            PluginManager loader = new PluginManager(getAssets());

            try {
                bridgeBuilder.addPlugins(loader.loadPluginClasses());
            } catch (PluginLoadException ex) {
                Logger.error("Error loading plugins.", ex);
            }

            this.load();
        }

        activityDepth++;
        this.bridge.onStart();
        Logger.debug("App started");
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
        bridge.getApp().fireStatusChange(true);
        this.bridge.onResume();
        Logger.debug("App resumed");
    }

    @Override
    public void onPause() {
        super.onPause();
        this.bridge.onPause();
        Logger.debug("App paused");
    }

    @Override
    public void onStop() {
        super.onStop();

        activityDepth = Math.max(0, activityDepth - 1);
        if (activityDepth == 0) {
            bridge.getApp().fireStatusChange(false);
        }

        this.bridge.onStop();
        Logger.debug("App stopped");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        this.bridge.onDestroy();
        Logger.debug("App destroyed");
    }

    @Override
    public void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        this.bridge.onDetachedFromWindow();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (this.bridge == null) {
            return;
        }

        this.bridge.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (this.bridge == null) {
            return;
        }

        this.bridge.onActivityResult(requestCode, resultCode, data);
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
    public void onBackPressed() {
        if (this.bridge == null) {
            return;
        }

        this.bridge.onBackPressed();
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
