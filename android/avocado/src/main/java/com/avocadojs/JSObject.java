package com.avocadojs;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * A wrapper around JSONObject that isn't afraid to do simple
 * JSON put operations without having to throw an exception
 * for every little thing jeez
 */
public class JSObject extends JSONObject {
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
