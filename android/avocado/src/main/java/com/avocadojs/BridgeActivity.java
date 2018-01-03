package com.avocadojs;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.webkit.WebView;

import com.avocadojs.android.R;

public class BridgeActivity extends AppCompatActivity {
  private Bridge bridge;

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

  @Override
  public void onStart() {
    super.onStart();
    Log.d(Bridge.TAG, "App started");
  }

  @Override
  public void onResume() {
    super.onResume();
    Log.d(Bridge.TAG, "App resumed");
  }

  @Override
  public void onPause() {
    super.onPause();
    Log.d(Bridge.TAG, "App paused");
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