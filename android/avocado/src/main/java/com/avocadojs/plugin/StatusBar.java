package com.avocadojs.plugin;

import android.view.View;

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

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
