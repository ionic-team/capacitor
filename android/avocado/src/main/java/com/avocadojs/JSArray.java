package com.avocadojs;

import org.json.JSONArray;
import org.json.JSONException;

public class JSArray extends JSONArray {
  public JSArray() {
    super();
  }

  public JSArray(Object array) throws JSONException {
    super(array);
  }

  /**
   * Create a new JSArray without throwing a fit
   */
  public static JSArray from(Object array) {
    try {
      return new JSArray(array);
    } catch(JSONException ex) {}
    return null;
  }
}
