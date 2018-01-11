package com.getcapacitor.plugin;

import android.net.Uri;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

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
