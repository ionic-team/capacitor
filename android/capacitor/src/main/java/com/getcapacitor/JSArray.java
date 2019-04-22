package com.getcapacitor;

import org.json.JSONArray;
import org.json.JSONException;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;


public class JSArray extends JSONArray {
  public JSArray() {
    super();
  }

  public JSArray(Object array) throws JSONException {
    super();

    final int length = Array.getLength(array);
    for (int i = 0; i < length; ++i) {
      put(JSObject.wrap(Array.get(array, i)));
    }
  }

  @SuppressWarnings("unchecked")
  public <E> List<E> toList() throws JSONException {
    List<E> items = new ArrayList<>();
    Object o = null;
    for(int i = 0; i < this.length(); i++) {
      o = this.get(i);
      try {
        items.add((E) this.get(i));
      } catch(Exception ex) {
        throw new JSONException("Not all items are instances of the given type");
      }
    }
    return items;
  }

  /**
   * Create a new JSArray without throwing a error
   */
  public static JSArray from(Object array) {
    try {
      return new JSArray(array);
    } catch(JSONException ex) {}
    return null;
  }
}
