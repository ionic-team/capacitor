package com.avocadojs.plugin;

import android.view.accessibility.AccessibilityManager;

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
    AccessibilityManager am = (AccessibilityManager) getContext().getSystemService(ACCESSIBILITY_SERVICE);

    JSObject ret = new JSObject();
    ret.put("value", am.isTouchExplorationEnabled());
    call.success(ret);
  }
}
