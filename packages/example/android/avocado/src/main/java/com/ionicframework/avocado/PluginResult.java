package com.ionicframework.avocado;

import org.json.JSONObject;
import android.util.Log;


public class PluginResult {
    private JSONObject json = new JSONObject();

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
