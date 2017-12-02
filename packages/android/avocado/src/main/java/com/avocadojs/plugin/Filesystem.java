package com.avocadojs.plugin;

import com.avocadojs.Avocado;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;

public class Filesystem extends PluginBase {
  public Filesystem(Avocado avocado) {
    super(avocado, "com.avocadojs.plugin.filesystem");
  }

  public void readFile(PluginCall call) {
    String level = call.data.optString("level", "log").toLowerCase();
  }

  public void writeFile(PluginCall call) {

  }

  public void appendFile(PluginCall call) {

  }

  public void mkdir(PluginCall call) {

  }

  public void rmdir(PluginCall call) {

  }

  public void readdir(PluginCall call) {

  }

  public void stat(PluginCall call) {

  }
}
