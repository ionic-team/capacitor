package com.avocadojs.myapp;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.webkit.WebView;

import com.avocadojs.Bridge;
import com.avocadojs.plugin.Console;
import com.avocadojs.plugin.Device;


public class MainActivity extends AppCompatActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    WebView webView = findViewById(R.id.webview);
    Bridge bridge = new Bridge(this, webView);
  }

}
