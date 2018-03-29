package com.getcapacitor.plugin;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import android.widget.Toast;

@NativePlugin()
public class Toast extends Plugin {

  @PluginMethod()
  public void show(PluginCall call) {

    String text = call.getString("text");

    String duration = call.getString("duration", "short");

    if (text == null) {
      call.error("Must provide a message");
      return;
    }

    Toast toast = Toast.makeText(getContext(), text, Toast.LENGTH_SHORT);

    switch (duration ) {
      case "short":
        toast.setDuration(Toast.LENGTH_SHORT);
        break;
      case "long":
        toast.setDuration(Toast.LENGTH_LONG);
        break;
    }

    toast.show();

    call.success();
  }
}
