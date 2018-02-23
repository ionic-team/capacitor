package com.getcapacitor;

import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;

/**
 * Wraps a call from the web layer to native
 */
public class PluginCall {
  /**
   * A special callback id that indicates there is no matching callback
   * on the client to associate any PluginCall results back to. This is used
   * in the case of an app resuming with saved instance data, for example.
   */
  public static final String CALLBACK_ID_DANGLING = "-1";

  private final MessageHandler msgHandler;
  private final String pluginId;
  private final String callbackId;
  private final String methodName;
  private final JSObject data;

  private boolean shouldSave = false;

  /**
   * Indicates that this PluginCall was released, and should no longer be used
   */
  private boolean isReleased = false;

  public PluginCall(MessageHandler msgHandler, String pluginId, String callbackId, String methodName, JSObject data) {
    this.msgHandler = msgHandler;
    this.pluginId = pluginId;
    this.callbackId = callbackId;
    this.methodName = methodName;
    this.data = data;
  }

  public void successCallback(PluginResult successResult) {
    if(this.callbackId == "-1") {
      // don't send back response if the callbackId was "-1"
      return;
    }

    this.msgHandler.sendResponseMessage(this, successResult, null);
  }


  public void success(JSObject data) {
    PluginResult result = new PluginResult(data);
    this.msgHandler.sendResponseMessage(this, result, null);
  }

  public void success() {
    this.success(new JSObject());
  }

  public void resolve(JSObject data) {
    PluginResult result = new PluginResult(data);
    this.msgHandler.sendResponseMessage(this, result, null);
  }

  public void resolve() {
    this.success(new JSObject());
  }

  public void errorCallback(String msg) {
    PluginResult errorResult = new PluginResult();

    try {
      errorResult.put("message", msg);
    } catch (Exception jsonEx) {
      Log.e(Bridge.TAG, jsonEx.toString());
    }

    this.msgHandler.sendResponseMessage(this, null, errorResult);
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

    this.msgHandler.sendResponseMessage(this, null, errorResult);
  }

  public void error(String msg) {
    error(msg, null);
  }

  public void reject(String msg, Exception ex) {
    error(msg, ex);
  }

  public void reject(String msg) {
    error(msg, null);
  }


  public String getPluginId() { return this.pluginId; }

  public String getCallbackId() {
    return this.callbackId;
  }

  public String getMethodName() { return this.methodName; }

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

  public Float getFloat(String name) {
    return this.getFloat(name, null);
  }
  public Float getFloat(String name, Float defaultValue) {
    Object value = this.data.opt(name);
    if(value == null) { return defaultValue; }

    if(value instanceof Float) {
      return (Float) value;
    }
    return defaultValue;
  }

  public Double getDouble(String name) {
    return this.getDouble(name, null);
  }
  public Double getDouble(String name, Double defaultValue) {
    Object value = this.data.opt(name);
    if(value == null) { return defaultValue; }

    if(value instanceof Double) {
      return (Double) value;
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

  public boolean hasOption(String name) {
    return this.data.has(name);
  }

  /**
   * Indicate that the Bridge should cache this call in order to call
   * it again later. For example, the addListener system uses this to
   * continuously call the call's callback (😆).
   */
  public void save() {
    this.shouldSave = true;
  }

  public void release(Bridge bridge) {
    this.shouldSave = false;
    bridge.releaseCall(this);
    this.isReleased = true;
  }

  public boolean isSaved() {
    return shouldSave;
  }

  public boolean isReleased() {
    return isReleased;
  }

  class PluginCallDataTypeException extends Exception {
    PluginCallDataTypeException(String m) { super(m); }
  }
}

