package com.avocadojs.plugin;

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@NativePlugin(id="com.avocadojs.plugin.camera")
public class Camera extends Plugin {

  @PluginMethod()
  public void getPhoto(PluginCall call) {
    int quality = call.getInt("quality", 100).intValue();
    boolean allowEditing = call.getBoolean("allowEditing", false).booleanValue();

  }

}
