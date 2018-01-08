package com.getcapacitor.plugin;

import android.util.Log;
import android.view.accessibility.AccessibilityManager;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import static android.content.Context.ACCESSIBILITY_SERVICE;

@NativePlugin()
public class Accessibility extends Plugin {

  @PluginMethod()
  public void isScreenReaderEnabled(PluginCall call) {
    Log.d(Bridge.TAG, "Checking for screen reader");
    AccessibilityManager am = (AccessibilityManager) getContext().getSystemService(ACCESSIBILITY_SERVICE);
    Log.d(Bridge.TAG, "Is it enabled? " + am.isTouchExplorationEnabled());
    JSObject ret = new JSObject();
    ret.put("value", am.isTouchExplorationEnabled());
    call.success(ret);
  }

  @PluginMethod()
  public void speak(PluginCall call) {
    // Not yet implemented
    throw new UnsupportedOperationException();
  }

}
