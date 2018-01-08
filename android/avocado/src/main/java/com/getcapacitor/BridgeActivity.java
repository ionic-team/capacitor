package com.getcapacitor;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.webkit.WebView;

import com.getcapacitor.android.R;
import com.getcapacitor.plugin.App;

public class BridgeActivity extends AppCompatActivity {
  private Bridge bridge;

  private int activityDepth = 0;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.bridge_layout_main);

  }

  protected void load() {
    Log.d(Bridge.TAG, "Starting BridgeActivity");

    WebView webView = findViewById(R.id.webview);
    bridge = new Bridge(this, webView);
  }

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
  public void onStart() {
    super.onStart();

    activityDepth++;

    Log.d(Bridge.TAG, "App started");
  }

  @Override
  public void onResume() {
    super.onResume();

    fireAppStateChanged(true);

    Log.d(Bridge.TAG, "App resumed");
  }

  @Override
  public void onPause() {
    super.onPause();

    Log.d(Bridge.TAG, "App paused");
  }

  @Override
  public void onStop() {
    super.onStop();

    activityDepth = Math.max(0, activityDepth - 1);
    if (activityDepth == 0) {
      fireAppStateChanged(false);
    }

    Log.d(Bridge.TAG, "App stopped");
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    Log.d(Bridge.TAG, "App destroyed");
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
    if(this.bridge == null) {
      return;
    }

    this.bridge.onRequestPermissionsResult(requestCode, permissions, grantResults);
  }

  @Override
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    if(this.bridge == null) {
      return;
    }

    this.bridge.onActivityResult(requestCode, resultCode, data);
  }
}