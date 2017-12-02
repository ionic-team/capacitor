package com.avocadojs.plugin;

import android.util.Log;

import com.avocadojs.Avocado;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;


public class Console extends PluginBase {

  public Console(Avocado avocado) {
    super(avocado, "com.avocadojs.plugin.console");
  }

  public void log(PluginCall call) {
    String level = call.data.optString("level", "log").toLowerCase();
    String message = call.data.optString("message", "");

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
