package com.getcapacitor;

import android.app.Activity;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * Management interface for accessing values in capacitor.config.json
 */
public class Config {
  private JSONObject config = new JSONObject();

  private static Config instance;

  private static Config getInstance() {
    if (instance == null) {
      instance = new Config();
    }
    return instance;
  }

  // Load our capacitor.config.json
  public static void load(Activity activity) {
    Config.getInstance().loadConfig(activity);
  }

  private void loadConfig(Activity activity) {
    BufferedReader reader = null;
    try {
      reader = new BufferedReader(new InputStreamReader(activity.getAssets().open("capacitor.config.json")));

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
      Log.e(Bridge.TAG, "Unable to load capacitor.config.json. Run npx cap copy first", ex);
    } catch (JSONException ex) {
      Log.e(Bridge.TAG, "Unable to parse capacitor.config.json. Make sure it's valid json", ex);
    } finally {
      if (reader != null) {
        try {
          reader.close();
        } catch (IOException e) {
        }
      }
    }
  }

  public static JSONObject getObject(String key) {
    try {
      return getInstance().config.getJSONObject(key);
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
      o = this.config.getJSONObject(k);
    }
    return o;
  }

  public static String getString(String key) {
    return getString(key, null);
  }

  public static String getString(String key, String defaultValue) {
    String k = getConfigKey(key);
    try {
      JSONObject o = getInstance().getConfigObjectDeepest(key);

      String value = o.getString(k);
      if (value == null) {
        return defaultValue;
      }
      return value;
    } catch (Exception ex) {}
    return defaultValue;
  }

  public static boolean getBoolean(String key, boolean defaultValue) {
    String k = getConfigKey(key);
    try {
      JSONObject o = getInstance().getConfigObjectDeepest(key);

      return o.getBoolean(k);
    } catch (Exception ex) {}
    return defaultValue;
  }

  private static String getConfigKey(String key) {
    String[] parts = key.split("\\.");
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
    return null;
  }


}
