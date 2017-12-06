package com.avocadojs.plugin;

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@NativePlugin(id="com.avocadojs.plugin.toast")
public class Toast extends Plugin {

  @PluginMethod()
  public void show(PluginCall call) {
    CharSequence text = call.getString("text");
    if(text == null) {
      call.error("Must provide text");
      return;
    }

    String durationType = call.getString("durationType", "short");

    int duration = android.widget.Toast.LENGTH_SHORT;
    if(durationType == "long") {
      duration = android.widget.Toast.LENGTH_LONG;
    }

    android.widget.Toast toast = android.widget.Toast.makeText(getContext(), text, duration);
    toast.show();
    call.success();
  }
}
