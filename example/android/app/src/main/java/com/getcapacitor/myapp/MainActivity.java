package com.getcapacitor.myapp;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.Splash;
import com.getcapacitor.myplugin.MyPlugin;

import java.lang.reflect.Array;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState, new Class[] {
        MyPlugin.class
    });
  }
}
