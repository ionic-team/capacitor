package com.avocadojs.plugin;

import com.avocadojs.Bridge;
import com.avocadojs.Plugin;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@Plugin(id="com.avocadojs.plugin.filesystem")
public class Filesystem extends PluginBase {

  @PluginMethod()
  public void readFile(PluginCall call) {
    String level = call.data.optString("level", "log").toLowerCase();
  }

  @PluginMethod()
  public void writeFile(PluginCall call) {

  }

  @PluginMethod()
  public void appendFile(PluginCall call) {

  }

  @PluginMethod()
  public void mkdir(PluginCall call) {

  }

  @PluginMethod()
  public void rmdir(PluginCall call) {

  }

  @PluginMethod()
  public void readdir(PluginCall call) {

  }

  @PluginMethod()
  public void stat(PluginCall call) {

  }
}
