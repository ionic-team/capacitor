package com.getcapacitor;

import android.app.Activity;
import android.content.res.AssetManager;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * Management interface for accessing values in capacitor.config.json
 */
public class Config {

  private JSONObject config = new JSONObject();

  public Config(AssetManager assetManager, JSONObject config) {
    if (config != null) {
      this.config = config;
    } else {
      // Load our capacitor.config.json
      this.loadConfig(assetManager);
    }
  }

  private void loadConfig(AssetManager assetManager) {
    BufferedReader reader = null;
    try {
      reader = new BufferedReader(new InputStreamReader(assetManager.open("capacitor.config.json")));

      // do reading, usually loop until end of file reading
      StringBuilder b = new StringBuilder();
      String line;
      while ((line = reader.readLine()) != null) {
        //process line
        b.append(line);
      }

      String jsonString = b.toString();
      this.config = new JSONObject(jsonString);
    } catch (IOException ex) {
      Logger.error("Unable to load capacitor.config.json. Run npx cap copy first", ex);
    } catch (JSONException ex) {
      Logger.error("Unable to parse capacitor.config.json. Make sure it's valid json", ex);
    } finally {
      if (reader != null) {
        try {
          reader.close();
        } catch (IOException e) {
        }
      }
    }
  }

  public JSONObject getObject(String key) {
    try {
      return this.config.getJSONObject(key);
    } catch (Exception ex) {
    }
    return null;
  }

  private JSONObject getConfigObjectDeepest(String key) throws JSONException {
    // Split on periods
    String[] parts = key.split("\\.");

    JSONObject o = this.config;
    // Search until the second to last part of the key
    for (int i = 0; i < parts.length-1; i++) {
      String k = parts[i];
      o = o.getJSONObject(k);
    }
    return o;
  }

  public String getString(String key) {
    return getString(key, null);
  }

  public String getString(String key, String defaultValue) {
    String k = getConfigKey(key);
    try {
      JSONObject o = this.getConfigObjectDeepest(key);

      String value = o.getString(k);
      if (value == null) {
        return defaultValue;
      }
      return value;
    } catch (Exception ex) {}
    return defaultValue;
  }

  public boolean getBoolean(String key, boolean defaultValue) {
    String k = getConfigKey(key);
    try {
      JSONObject o = this.getConfigObjectDeepest(key);

      return o.getBoolean(k);
    } catch (Exception ex) {}
    return defaultValue;
  }

  public int getInt(String key, int defaultValue) {
    String k = getConfigKey(key);
    try {
      JSONObject o = this.getConfigObjectDeepest(key);
      return o.getInt(k);
    } catch (Exception ignore) {
      // value was not found
    }
    return defaultValue;
  }

  private String getConfigKey(String key) {
    String[] parts = key.split("\\.");
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
    return null;
  }

  public String[] getArray(String key) {
    return getArray(key, null);
  }

  public String[] getArray(String key, String[] defaultValue) {
    String k = getConfigKey(key);
    try {
      JSONObject o = this.getConfigObjectDeepest(key);

      JSONArray a = o.getJSONArray(k);
      if (a == null) {
        return defaultValue;
      }

      int l = a.length();
      String[] value = new String[l];

      for(int i=0; i<l; i++) {
        value[i] = (String) a.get(i);
      }

      return value;
    } catch (Exception ex) {}
    return defaultValue;
  }
}
