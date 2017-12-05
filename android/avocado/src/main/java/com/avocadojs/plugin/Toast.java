package com.avocadojs.plugin;

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@NativePlugin(id="com.avocadojs.plugin.toast")
public class Toast extends Plugin {

  @PluginMethod()
  public void show(PluginCall call) {
  }
}
