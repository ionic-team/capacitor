package com.getcapacitor;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONException;

public class JSArray extends JSONArray {

    public JSArray() {
        super();
    }

    public JSArray(String json) throws JSONException {
        super(json);
    }

    public JSArray(Collection copyFrom) {
        super(copyFrom);
    }

    public JSArray(Object array) throws JSONException {
        super(array);
    }

    @SuppressWarnings("unchecked")
    public <E> List<E> toList() throws JSONException {
        List<E> items = new ArrayList<>();
        Object o = null;
        for (int i = 0; i < this.length(); i++) {
            o = this.get(i);
            try {
                items.add((E) this.get(i));
            } catch (Exception ex) {
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
        } catch (JSONException ex) {}
        return null;
    }
}
