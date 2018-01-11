package com.getcapacitor.plugin;

import android.view.View;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class StatusBar extends Plugin {

  @PluginMethod()
  public void setStyle(PluginCall call) {
    String style = call.getString("style");
    if(style == null) {
      call.error("Style must be provided");
      return;
    }

    View decorView = getActivity().getWindow().getDecorView();


    decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

  }

  @PluginMethod()
  public void hide(PluginCall call) {
    View decorView = this.getActivity().getWindow().getDecorView();

    // Hide the status bar.
    int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN;
    decorView.setSystemUiVisibility(uiOptions);
  }

  @PluginMethod()
  public void show(PluginCall call) {
    View decorView = this.getActivity().getWindow().getDecorView();

    // Hide the status bar.
    int uiOptions = View.SYSTEM_UI_FLAG_VISIBLE;
    decorView.setSystemUiVisibility(uiOptions);
  }
}
