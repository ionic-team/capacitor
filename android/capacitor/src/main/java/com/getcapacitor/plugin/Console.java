package com.getcapacitor.plugin;

import android.util.Log;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;


@NativePlugin()
public class Console extends Plugin {

  private static final String TAG_CONSOLE = "console";

  @PluginMethod(returnType = PluginMethod.RETURN_NONE)
  public void log(PluginCall call) {
    String level = call.getString("level");
    String message = call.getString("message", "");

    if ("error".equalsIgnoreCase(level)) {
      Log.e(TAG_CONSOLE, message);
    } else if ("warn".equalsIgnoreCase(level)) {
      Log.w(TAG_CONSOLE, message);
    } else if ("debug".equalsIgnoreCase(level)) {
      Log.d(TAG_CONSOLE, message);
    } else {
      Log.i(TAG_CONSOLE, message);
    }
  }

}
