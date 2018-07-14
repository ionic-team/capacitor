package com.getcapacitor;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * A wrapper around JSONObject that isn't afraid to do simple
 * JSON put operations without having to throw an exception
 * for every little thing jeez
 */
public class JSObject extends JSONObject {
  public JSObject() {
    super();
  }

  public JSObject(String json) throws JSONException {
    super(json);
  }

  public JSObject(JSONObject obj, String[] names) throws JSONException {
    super(obj, names);
  }

  /**
   * Convert a pathetic JSONObject into a JSObject
   * @param obj
   */
  public static JSObject fromJSONObject(JSONObject obj) throws JSONException {
    Iterator<String> keysIter = obj.keys();
    List<String> keys = new ArrayList<>();
    while (keysIter.hasNext()) {
      keys.add(keysIter.next());
    }

    return new JSObject(obj, keys.toArray(new String[keys.size()]));
  }

  public String getString(String key) {
    return getString(key, null);
  }

  public String getString(String key, String defaultValue) {
    try {
      String value = super.getString(key);
      if (value != null) {
        return value;
      }
    } catch (JSONException ex) {
    }
    return defaultValue;
  }

  public Integer getInteger(String key, Integer defaultValue) {
    try {
      return super.getInt(key);
    } catch (JSONException e) {
    }
    return defaultValue;
  }

  public Integer getInteger(String key) {
    return getInteger(key, null);
  }

  public Boolean getBoolean(String key, Boolean defaultValue) {
    try {
      return super.getBoolean(key);
    } catch (JSONException e) {
    }
    return defaultValue;
  }

  /**
   * Fetch boolean from jsonObject
   */
  public Boolean getBool(String key) {
    return getBoolean(key,null);
  }

  public JSObject getJSObject(String name) {
    try {
      return  getJSObject(name, null);
    } catch (JSONException e) {
    }
    return null;
  }

  public JSObject getJSObject(String name, JSObject defaultValue) throws JSONException {
    try {
      Object obj = get(name);
      if (obj instanceof JSONObject) {
        Iterator<String> keysIter = ((JSONObject) obj).keys();
        List<String> keys = new ArrayList<>();
        while (keysIter.hasNext()) {
          keys.add(keysIter.next());
        }

        return new JSObject((JSONObject) obj, keys.toArray(new String[keys.size()]));
      }
    } catch (JSONException ex) {
    }
    return defaultValue;
  }

  @Override
  public JSObject put(String key, boolean value) {
    try {
      super.put(key, value);
    } catch(JSONException ex) {}
    return this;
  }

  @Override
  public JSObject put(String key, int value) {
    try {
      super.put(key, value);
    } catch(JSONException ex) {}
    return this;
  }

  @Override
  public JSObject put(String key, long value) {
    try {
      super.put(key, value);
    } catch(JSONException ex) {}
    return this;
  }

  @Override
  public JSObject put(String key, double value) {
    try {
      super.put(key, value);
    } catch(JSONException ex) {}
    return this;
  }

  @Override
  public JSObject put(String key, Object value) {
    try {
      super.put(key, value);
    } catch(JSONException ex) {}
    return this;
  }

  public JSObject put(String key, String value) {
    try {
      super.put(key, value);
    } catch(JSONException ex) {}
    return this;
  }

  public JSObject putSafe(String key, Object value) throws JSONException {
    return (JSObject) super.put(key, value);
  }
}
