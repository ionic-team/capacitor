package com.getcapacitor.plugin;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
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
    if("long".equals(durationType)) {
      duration = android.widget.Toast.LENGTH_LONG;
    }

    android.widget.Toast toast = android.widget.Toast.makeText(getContext(), text, duration);
    toast.show();
    call.success();
  }
}
