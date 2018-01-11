package com.getcapacitor.plugin;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import org.json.JSONArray;

@NativePlugin()
public class Permissions extends Plugin {

  @PluginMethod
  public void request(PluginCall call) {
    JSONArray permissions = call.getArray("permissions");
    String permission = call.getString("permission");
  }
}
