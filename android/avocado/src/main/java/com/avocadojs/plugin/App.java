package com.avocadojs.plugin;

import android.net.Uri;
import android.util.Log;

import com.avocadojs.Bridge;
import com.avocadojs.JSObject;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@NativePlugin()
public class App extends Plugin {
  /*
  public void firePluginError(_ jsError: JSProcessingError) {
    notifyListeners("pluginError", data: [
    "message": jsError.localizedDescription
    ])
  }
  */

  // TODO: Implement this
  public void firePluginError() {
  }

  public void fireChange(boolean isActive) {
    Log.d(Bridge.TAG, "Firing change: " + isActive);
    JSObject data = new JSObject();
    data.put("isActive", isActive);
    notifyListeners("appStateChanged", data);
  }

  @PluginMethod()
  public void getLaunchUrl(PluginCall call) {
    Uri launchUri = bridge.getIntentUri();
    if (launchUri != null) {
      JSObject d = new JSObject();
      d.put("url", launchUri.toString());
      call.success(d);
    } else {
      call.success();
    }
  }
}
