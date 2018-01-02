package com.avocadojs.plugin;

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

import org.json.JSONArray;

@NativePlugin()
public class Permissions extends Plugin {

  @PluginMethod
  public void request(PluginCall call) {
    JSONArray permissions = call.getArray("permissions");
    String permission = call.getString("permission");
  }
}
