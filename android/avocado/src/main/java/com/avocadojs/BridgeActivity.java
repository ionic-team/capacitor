package com.avocadojs;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.webkit.WebView;

import com.avocadojs.android.R;

public class BridgeActivity extends AppCompatActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.bridge_layout_main);
  }

  protected void load() {
    Log.d(Bridge.TAG, "Starting Avocado Activity");

    WebView webView = findViewById(R.id.webview);
    Bridge bridge = new Bridge(this, webView);
  }
}