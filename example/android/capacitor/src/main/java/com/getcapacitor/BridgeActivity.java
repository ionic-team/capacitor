package com.getcapacitor;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.webkit.WebView;

import com.getcapacitor.android.R;
import com.getcapacitor.plugin.App;

public class BridgeActivity extends AppCompatActivity {
  private Bridge bridge;

  private int activityDepth = 0;

  private String lastActivityPlugin;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    Splash.showOnLaunch(this);

    getApplication().setTheme(getResources().getIdentifier("AppTheme_NoActionBar", "style", getPackageName()));
    //setTheme(R.style.AppTheme_NoActionBar);
    //getWindow().setBackgroundDrawable(new ColorDrawable(Color.parseColor("#FF0000")));

    setContentView(R.layout.bridge_layout_main);

    this.load(savedInstanceState);
  }

  /**
   * Load the WebView and create the Bridge
   */
  protected void load(Bundle savedInstanceState) {
    Log.d(Bridge.TAG, "Starting BridgeActivity");

    WebView webView = findViewById(R.id.webview);
    bridge = new Bridge(this, webView);

    if (savedInstanceState != null) {
      bridge.restoreInstanceState(savedInstanceState);
    }
  }

  /**
   * Notify the App plugin that the current state changed
   * @param isActive
   */
  private void fireAppStateChanged(boolean isActive) {
    PluginHandle handle = bridge.getPlugin("App");
    if (handle == null) {
      return;
    }

    App appState = (App) handle.getInstance();
    if (appState != null) {
      appState.fireChange(isActive);
    }
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

    Log.d(Bridge.TAG, "App started");
  }

  @Override
  public void onRestart() {
    super.onRestart();
    this.bridge.onRestart();
    Log.d(Bridge.TAG, "App restarted");
  }

  @Override
  public void onResume() {
    super.onResume();

    fireAppStateChanged(true);

    this.bridge.onResume();

    Log.d(Bridge.TAG, "App resumed");
  }

  @Override
  public void onPause() {
    super.onPause();

    this.bridge.onPause();

    Log.d(Bridge.TAG, "App paused");
  }

  @Override
  public void onStop() {
    super.onStop();

    activityDepth = Math.max(0, activityDepth - 1);
    if (activityDepth == 0) {
      fireAppStateChanged(false);
    }

    this.bridge.onStop();

    Log.d(Bridge.TAG, "App stopped");
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    Log.d(Bridge.TAG, "App destroyed");
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
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
    if (this.bridge == null) {
      return;
    }

    this.bridge.onNewIntent(intent);
  }
}
