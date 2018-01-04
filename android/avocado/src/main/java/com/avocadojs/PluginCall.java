package com.avocadojs;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.support.v4.app.ActivityCompat;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;

/**
 * Wraps a call from the web layer to native
 */
public class PluginCall {
  private final MessageHandler msgHandler;
  private final String callbackId;
  private final JSObject data;
  private boolean shouldSave = false;

  public PluginCall(MessageHandler msgHandler, String callbackId, JSObject data) {
    this.msgHandler = msgHandler;
    this.callbackId = callbackId;
    this.data = data;
  }

  public void successCallback(PluginResult successResult) {
    if(this.callbackId == "-1") {
      // don't send back response if the callbackId was "-1"
      return;
    }

    this.msgHandler.responseMessage(this.callbackId, successResult, null);
  }


  public void success(JSObject data) {
    PluginResult result = new PluginResult(data);
    this.msgHandler.responseMessage(this.callbackId, result, null);
  }

  public void success() {
    this.success(new JSObject());
  }


  public void errorCallback(String msg) {
    PluginResult errorResult = new PluginResult();

    try {
      errorResult.put("message", msg);
    } catch (Exception jsonEx) {
      Log.e(Bridge.TAG, jsonEx.toString());
    }

    this.msgHandler.responseMessage(this.callbackId, null, errorResult);
  }

  public void error(String msg, Exception ex) {
    PluginResult errorResult = new PluginResult();

    if(ex != null) {
      ex.printStackTrace();
    }

    try {
      errorResult.put("message", msg);
    } catch (Exception jsonEx) {
      Log.e(Bridge.TAG, jsonEx.toString());
    }

    this.msgHandler.responseMessage(this.callbackId, null, errorResult);
  }

  public void error(String msg) {
    this.error(msg, null);
  }

  public String getCallbackId() {
    return this.callbackId;
  }

  public JSObject getData() {
    return this.data;
  }

  public String getString(String name) {
    return this.getString(name, null);
  }
  public String getString(String name, String defaultValue) {
    Object value = this.data.opt(name);
    if(value == null) { return defaultValue; }

    if(value instanceof String) {
      return (String) value;
    }
    return defaultValue;
  }

  public Integer getInt(String name) {
    return this.getInt(name, null);
  }
  public Integer getInt(String name, Integer defaultValue) {
    Object value = this.data.opt(name);
    if(value == null) { return defaultValue; }

    if(value instanceof Integer) {
      return (Integer) value;
    }
    return defaultValue;
  }

  public Boolean getBoolean(String name) {
    return this.getBoolean(name, null);
  }
  public Boolean getBoolean(String name, Boolean defaultValue) {
    Object value = this.data.opt(name);
    if(value == null) { return defaultValue; }

    if(value instanceof Boolean) {
      return (Boolean) value;
    }
    return defaultValue;
  }

  public JSObject getObject(String name) {
    return this.getObject(name, new JSObject());
  }

  public JSObject getObject(String name, JSObject defaultValue) {
    Object value = this.data.opt(name);
    if(value == null) { return defaultValue; }

    if(value instanceof JSObject) {
      return (JSObject) value;
    }
    return defaultValue;
  }

  public JSArray getArray(String name) {
    return this.getArray(name, new JSArray());
  }

  /**
   * Get a JSONArray and turn it into a JSArray
   * @param name
   * @param defaultValue
   * @return
   */
  public JSArray getArray(String name, JSArray defaultValue) {
    Object value = this.data.opt(name);
    if(value == null) { return defaultValue; }

    if(value instanceof JSONArray) {
      try {
        JSONArray valueArray = (JSONArray) value;
        List<Object> items = new ArrayList<>();
        for (int i = 0; i < valueArray.length(); i++) {
          items.add(valueArray.get(i));
        }
        return new JSArray(items.toArray());
      } catch(JSONException ex) {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  /**
   * Indicate that the Bridge should cache this call in order to call
   * it again later. For example, the addListener system uses this to
   * continuously call the call's callback (😆).
   * @param shouldSave
   */
  public void setSaved(boolean shouldSave) {
    this.shouldSave = shouldSave;
  }

  public boolean isSaved() {
    return shouldSave;
  }

  class PluginCallDataTypeException extends Exception {
    PluginCallDataTypeException(String m) { super(m); }
  }
}

