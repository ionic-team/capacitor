package com.avocadojs.plugin;

import com.avocadojs.Plugin;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@Plugin(id="com.avocadojs.plugin.statusbar")
public class StatusBar extends PluginBase {

  @PluginMethod()
  public void setStyle(PluginCall call) {
    String style = call.getString("style");
  }
}
