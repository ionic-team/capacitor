package com.avocadojs.plugin;

import android.util.Log;
import android.view.accessibility.AccessibilityManager;

import com.avocadojs.Bridge;
import com.avocadojs.JSObject;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

import org.json.JSONObject;

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

}
