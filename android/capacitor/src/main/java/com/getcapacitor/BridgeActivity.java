package com.getcapacitor;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.getcapacitor.android.R;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONObject;

public class BridgeActivity extends AppCompatActivity {

    protected Bridge bridge;
    protected boolean keepRunning = true;
    private JSONObject config;
    private int activityDepth = 0;
    private List<Class<? extends Plugin>> initialPlugins = new ArrayList<>();
    protected Bridge.Builder bridgeBuilder = new Bridge.Builder();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        bridgeBuilder.setInstanceState(savedInstanceState);
    }

    protected void init(Bundle savedInstanceState, List<Class<? extends Plugin>> plugins) {
        this.init(savedInstanceState, plugins, null);
    }

    protected void init(Bundle savedInstanceState, List<Class<? extends Plugin>> plugins, JSONObject config) {
        this.initialPlugins = plugins;
        this.config = config;

        this.load(savedInstanceState);
    }

    /**
     * Load the WebView and create the Bridge
     */
    protected void load(Bundle savedInstanceState) {
        getApplication().setTheme(getResources().getIdentifier("AppTheme_NoActionBar", "style", getPackageName()));
        setTheme(getResources().getIdentifier("AppTheme_NoActionBar", "style", getPackageName()));
        setTheme(R.style.AppTheme_NoActionBar);
        setContentView(R.layout.bridge_layout_main);

        Logger.debug("Starting BridgeActivity");

        bridge = bridgeBuilder.setActivity(this).addPlugins(initialPlugins).setConfig(config).create();

        this.keepRunning = bridge.shouldKeepRunning();
        this.onNewIntent(getIntent());
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
        if (this.bridge == null) {
            return;
        }

        this.bridge.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onNewIntent(Intent intent) {
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
}
