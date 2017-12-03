package com.avocadojs.plugin;

import android.os.Environment;

import com.avocadojs.Bridge;
import com.avocadojs.Plugin;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@Plugin(id="com.avocadojs.plugin.filesystem")
public class Filesystem extends PluginBase {

  @PluginMethod()
  public void readFile(PluginCall call) {
    String file = call.getString("file");
    String directory = call.getString("directory");
    String encoding = call.getString("encoding");

    File fileDirectory = Environment.getDataDirectory();
    File fileObject = new File(fileDirectory, file);

    final StringBuilder text = new StringBuilder();

    try {
      BufferedReader br = new BufferedReader(new FileReader(file));
      String line;

      while ((line = br.readLine()) != null) {
        text.append(line);
        text.append('\n');
      }
      br.close();

      try {
        JSONObject ret = new JSONObject();
        ret.putOpt("data", text.toString());
        call.success(ret);
      } catch(JSONException ex) {
        call.error("Unable to return value for reading file", ex);
      }
    }
    catch (IOException e) {
      //You'll need to add proper error handling here
    }
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
