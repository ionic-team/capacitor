package com.avocadojs.myapp;

import android.os.Bundle;

import com.avocadojs.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    load();
  }
}
