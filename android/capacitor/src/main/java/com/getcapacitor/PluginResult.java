package com.getcapacitor;

import android.util.Log;

import org.json.JSONException;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;


/**
 * Wraps a result for web from calling a native plugin.
 */
public class PluginResult {
  private final JSObject json;

  public PluginResult() {
    this(new JSObject());
  }

  public PluginResult(JSObject json) {
    this.json = json;
  }

  public PluginResult put(String name, boolean value) {
    return this.jsonPut(name, value);
  }

  public PluginResult put(String name, double value) {
    return this.jsonPut(name, value);
  }

  public PluginResult put(String name, int value) {
    return this.jsonPut(name, value);
  }

  public PluginResult put(String name, long value) {
    return this.jsonPut(name, value);
  }

  /**
   * Format a date as an ISO string
   */
  public PluginResult put(String name, Date value) {
    TimeZone tz = TimeZone.getTimeZone("UTC");
    DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
    df.setTimeZone(tz);
    return this.jsonPut(name, df.format(value));
  }

  public PluginResult put(String name, Object value) {
    return this.jsonPut(name, value);
  }

  public PluginResult put(String name, PluginResult value) {
    return this.jsonPut(name, value.json);
  }

  PluginResult jsonPut(String name, Object value) {
    try {
      this.json.put(name, value);
    } catch (Exception ex) {
      Log.e(LogUtils.getPluginTag(), "", ex);
    }
    return this;
  }

  public String toString() {
    return this.json.toString();
  }

  public JSObject getData() {
    try {
      return this.json.getJSObject("data", new JSObject());
    } catch (JSONException ex) {
      return null;
    }
  }

  /**
   * Return a new data object with the actual payload data
   * along side additional metadata about the plugin. This is used
   * for appRestoredResult, as it's technically a raw data response
   * from a plugin, but with metadata about the plugin.
   * @return
   */
  public PluginResult getWrappedResult(PluginCall call) {
    JSObject ret = new JSObject();
    JSObject data = new JSObject();
    data.put("pluginId", call.getPluginId());
    data.put("methodName", call.getMethodName());
    data.put("data", getData());
    ret.put("data", data);
    return new PluginResult(ret);
  }
}
