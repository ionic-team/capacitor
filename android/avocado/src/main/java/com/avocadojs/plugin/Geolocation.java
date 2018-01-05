package com.avocadojs.plugin;

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@NativePlugin()
public class Geolocation extends Plugin {
  @PluginMethod()
  public void getCurrentPosition(PluginCall call) {

  }

  @PluginMethod()
  public void watchPosition(PluginCall call) {
  }
}
