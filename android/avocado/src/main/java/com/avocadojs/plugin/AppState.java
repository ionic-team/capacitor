package com.avocadojs.plugin;

import android.util.Log;

import com.avocadojs.Bridge;
import com.avocadojs.JSObject;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;

@NativePlugin()
public class AppState extends Plugin {
  /*
  public void firePluginError(_ jsError: JSProcessingError) {
    notifyListeners("pluginError", data: [
    "message": jsError.localizedDescription
    ])
  }
  */

  public void fireChange(boolean isActive) {
    Log.d(Bridge.TAG, "Firing change: " + isActive);
    JSObject data = new JSObject();
    data.put("isActive", isActive);
    notifyListeners("appStateChanged", data);
  }
}
