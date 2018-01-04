package com.avocadojs;

import org.json.JSONArray;
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

  public JSObject getJSObject(String name) throws JSONException {
    Object obj = get(name);
    if (obj instanceof JSONObject) {
      Iterator<String> keysIter = ((JSONObject) obj).keys();
      List<String> keys = new ArrayList<>();
      while (keysIter.hasNext()) {
        keys.add(keysIter.next());
      }

      return new JSObject((JSONObject) obj, keys.toArray(new String[keys.size()]));
    }
    return null;
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
