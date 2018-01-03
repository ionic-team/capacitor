package com.avocadojs.plugin;

import android.util.Log;

import com.avocadojs.Bridge;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;

import org.json.JSONObject;

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
    JSONObject data = new JSONObject();
    try {
      data.put("isActive", isActive);
      notifyListeners("appStateChanged", data);
    } catch(Exception ex) {
      Log.e(Bridge.TAG, "Serious error setting appStateChanged", ex);
    }
  }
}
