package com.getcapacitor.plugin;

import android.util.Log;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;


@NativePlugin()
public class Console extends Plugin {

  @PluginMethod(returnType=PluginMethod.RETURN_NONE)
  public void log(PluginCall call) {
    String level = call.getString("level", "log").toLowerCase();
    String message = call.getString("message", "");

    if (level == "error'") {
      Log.e("console", message);

    } else if (level == "warn'") {
      Log.w("console", message);

    } else if (level == "debug'") {
      Log.d("console", message);

    } else {
      Log.i("console", message);
    }
  }

}
