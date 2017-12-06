package com.avocadojs.plugin;

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@NativePlugin(id="com.avocadojs.plugin.deeplinks")
public class DeepLinks extends Plugin {

  @PluginMethod()
  public void getLaunchUrl(PluginCall call) {
  }
}
