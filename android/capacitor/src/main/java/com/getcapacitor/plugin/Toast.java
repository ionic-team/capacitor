package com.getcapacitor.plugin;

import android.view.Gravity;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class Toast extends Plugin {

  private static final int GRAVITY_TOP = Gravity.TOP|Gravity.CENTER_HORIZONTAL;
  private static final int GRAVITY_CENTER = Gravity.CENTER_VERTICAL|Gravity.CENTER_HORIZONTAL;
  private static final int GRAVITY_BOTTOM = Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL;

  private static final int BASE_TOP_BOTTOM_OFFSET = 20;

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

    String position = call.getString("position", "bottom");

    if("top".equals(position)) {
      toast.setGravity(GRAVITY_TOP, 0, BASE_TOP_BOTTOM_OFFSET);
    } else  if("bottom".equals(position)) {
      toast.setGravity(GRAVITY_BOTTOM, 0, BASE_TOP_BOTTOM_OFFSET);
    } else if("center".equals(position)) {
      toast.setGravity(GRAVITY_CENTER, 0, 0);
    } else {
      call.error("Invalid position. Valid options are 'top', 'center' and 'bottom'.");
      return;
    }

    toast.show();
    call.success();
  }
}
