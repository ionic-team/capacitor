package com.getcapacitor;

import androidx.annotation.Nullable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;

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

    @Override
    @Nullable
    public String getString(String key) {
        return getString(key, null);
    }

    @Nullable
    public String getString(String key, @Nullable String defaultValue) {
        try {
            String value = super.getString(key);
            if (!super.isNull(key)) {
                return value;
            }
        } catch (JSONException ex) {}
        return defaultValue;
    }

    @Nullable
    public Integer getInteger(String key) {
        return getInteger(key, null);
    }

    @Nullable
    public Integer getInteger(String key, @Nullable Integer defaultValue) {
        try {
            return super.getInt(key);
        } catch (JSONException e) {}
        return defaultValue;
    }

    @Nullable
    public Boolean getBoolean(String key, @Nullable Boolean defaultValue) {
        try {
            return super.getBoolean(key);
        } catch (JSONException e) {}
        return defaultValue;
    }

    /**
     * Fetch boolean from jsonObject
     */
    @Nullable
    public Boolean getBool(String key) {
        return getBoolean(key, null);
    }

    @Nullable
    public JSObject getJSObject(String name) {
        try {
            return getJSObject(name, null);
        } catch (JSONException e) {}
        return null;
    }

    @Nullable
    public JSObject getJSObject(String name, @Nullable JSObject defaultValue) throws JSONException {
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
        } catch (JSONException ex) {}
        return defaultValue;
    }

    @Override
    public JSObject put(String key, boolean value) {
        try {
            super.put(key, value);
        } catch (JSONException ex) {}
        return this;
    }

    @Override
    public JSObject put(String key, int value) {
        try {
            super.put(key, value);
        } catch (JSONException ex) {}
        return this;
    }

    @Override
    public JSObject put(String key, long value) {
        try {
            super.put(key, value);
        } catch (JSONException ex) {}
        return this;
    }

    @Override
    public JSObject put(String key, double value) {
        try {
            super.put(key, value);
        } catch (JSONException ex) {}
        return this;
    }

    @Override
    public JSObject put(String key, Object value) {
        try {
            super.put(key, value);
        } catch (JSONException ex) {}
        return this;
    }

    public JSObject put(String key, String value) {
        try {
            super.put(key, value);
        } catch (JSONException ex) {}
        return this;
    }

    public JSObject putSafe(String key, Object value) throws JSONException {
        return (JSObject) super.put(key, value);
    }
}
