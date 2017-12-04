package com.avocadojs;

import org.json.JSONObject;

import android.util.Log;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;


/**
 * Wraps a result for web from calling a native plugin.
 */
public class PluginResult {
  private final JSONObject json;

  public PluginResult() {
    this(new JSONObject());
  }

  public PluginResult(JSONObject json) {
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
      Log.e("PluginResultPut", ex.toString());
    }
    return this;
  }

  public String toString() {
    return this.json.toString();
  }
}
