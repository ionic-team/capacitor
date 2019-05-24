package com.getcapacitor.plugin;

import android.app.Activity;
import android.content.SharedPreferences;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.Set;

@NativePlugin()
public class Storage extends Plugin {
  private static final String PREFS_NAME = "CapacitorStorage";
  private SharedPreferences prefs;
  private SharedPreferences.Editor editor;

  public void load() {
    prefs = getContext().getSharedPreferences(PREFS_NAME, Activity.MODE_PRIVATE);
    editor = prefs.edit();
  }

  @PluginMethod()
  public void get(PluginCall call) {
    String key = call.getString("key");
    if (key == null) {
      call.reject("Must provide key");
      return;
    }
    String value = prefs.getString(key, null);

    JSObject ret = new JSObject();
    ret.put("value", value == null ? JSObject.NULL : value);
    call.resolve(ret);
  }

  @PluginMethod()
  public void set(PluginCall call) {
    String key = call.getString("key");
    if (key == null) {
      call.reject("Must provide key");
      return;
    }
    String value = call.getString("value");

    editor.putString(key, value);
    editor.apply();
    call.resolve();
  }

  @PluginMethod()
  public void remove(PluginCall call) {
    String key = call.getString("key");
    if (key == null) {
      call.reject("Must provide key");
      return;
    }

    editor.remove(key);
    editor.apply();
    call.resolve();
  }

  @PluginMethod()
  public void keys(PluginCall call) {
    Map<String, ?> values = prefs.getAll();
    Set<String> keys = values.keySet();
    String[] keyArray = keys.toArray(new String[keys.size()]);
    JSObject ret = new JSObject();
    try {
      ret.put("keys", new JSArray(keyArray));
    } catch (JSONException ex) {
      call.reject("Unable to create key array.");
      return;
    }
    call.resolve(ret);
  }

  @PluginMethod()
  public void clear(PluginCall call) {
    editor.clear();
    editor.apply();
    call.resolve();
  }
}
