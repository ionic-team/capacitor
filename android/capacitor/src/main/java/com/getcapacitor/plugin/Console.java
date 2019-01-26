package com.getcapacitor.plugin;

import android.util.Log;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;


@NativePlugin()
public class Console extends Plugin {

  @PluginMethod(returnType = PluginMethod.RETURN_NONE)
  public void log(PluginCall call) {
    String level = call.getString("level");
    String message = call.getString("message", "");

    if ("error".equalsIgnoreCase(level)) {
      Log.e(getLogTag(), message);
    } else if ("warn".equalsIgnoreCase(level)) {
      Log.w(getLogTag(), message);
    } else if ("debug".equalsIgnoreCase(level)) {
      Log.d(getLogTag(), message);
    } else if ("trace".equalsIgnoreCase(level)) {
      Log.v(getLogTag(), message);
    } else {
      Log.i(getLogTag(), message);
    }
  }

}
