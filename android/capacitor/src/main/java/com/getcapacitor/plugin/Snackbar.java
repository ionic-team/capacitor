package com.getcapacitor.plugin;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import android.graphics.Color;
import android.support.design.widget.Snackbar;
import android.view.View;

@NativePlugin()
public class Snackbar extends Plugin {

  private View getView() {
    return getActivity().getWindow().getDecorView().findViewById(android.R.id.content);
  }

  @PluginMethod()
  public void show(final PluginCall call) {

    String text = call.getString("text");

    String duration = call.getString("duration", "short");

    String button = call.getString("button");

    String color = call.getString("color");

    if (text == null) {
      call.error("Must provide a text");
      return;
    }

    final Snackbar snackbar = Snackbar.make(getView(), text, Snackbar.LENGTH_SHORT);

    switch (duration) {
      case "short":
        snackbar.setDuration(Snackbar.LENGTH_SHORT);
        break;
      case "long":
        snackbar.setDuration(Snackbar.LENGTH_LONG);
        break;
      case "indefinite":
        snackbar.setDuration(Snackbar.LENGTH_INDEFINITE);
        break;
    }

    if (button != null && !button.isEmpty()) {
      snackbar.setAction(button, new View.OnClickListener() {
        @Override
        public void onClick(View view) {
          snackbar.dismiss();
          JSObject ret = new JSObject();
          ret.put("clicked", true);
          call.success(ret);
        }
      });
    }

    if (color != null) {
      snackbar.setActionTextColor(Color.parseColor(color));
    }

    snackbar.show();

    call.success();

  }
  
}
