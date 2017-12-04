package com.avocadojs.plugin;

import android.app.ActionBar;
import android.view.View;

import com.avocadojs.Plugin;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@Plugin(id="com.avocadojs.plugin.statusbar")
public class StatusBar extends PluginBase {

  @PluginMethod()
  public void setStyle(PluginCall call) {
    String style = call.getString("style");
    if(style == null) {
      call.error("Style must be provided");
      return;
    }

    View decorView = getActivity().getWindow().getDecorView();


    decorView.setSystemUiVisibility(uiOptions | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

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
