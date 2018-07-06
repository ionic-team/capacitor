package com.getcapacitor.plugin.common;


import org.json.JSONException;
import org.json.JSONObject;

/**
 * Class responsible for providing helper methods for JSON object parsing
 */
public class JsonParserUtils {

  public static String JS_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSX";

  /**
   * Fetch string from jsonObject
   */
  public static String getString(String key, JSONObject jsonObj, String defaultValue) {
    try {
      return jsonObj.getString(key);
    } catch (JSONException e) {
      return defaultValue;
    }
  }

  /**
   * Fetch string from jsonObject
   */
  public static String getString(String key, JSONObject jsonObj) {
    return getString(key,jsonObj,null);
  }

  /**
   * Fetch int from jsonObject
   */
  public static Integer getInt(String key, JSONObject jsonObj, Integer defaultValue) {
    try {
      return jsonObj.getInt(key);
    } catch (JSONException e) {
      return defaultValue;
    }
  }
  /**
   * Fetch int from jsonObject
   */
  public static Integer getInt(String key, JSONObject jsonObj) {
    return getInt(key,jsonObj,null);
  }

  /**
   * Fetch int from jsonObject
   */
  public static Boolean getBoolean(String key, JSONObject jsonObj, Boolean defaultValue) {
    try {
      return jsonObj.getBoolean(key);
    } catch (JSONException e) {
      return defaultValue;
    }
  }

  /**
   * Fetch boolean from jsonObject
   */
  public static Boolean getBoolean(String key, JSONObject jsonObj) {
    return getBoolean(key,jsonObj,null);
  }

}
