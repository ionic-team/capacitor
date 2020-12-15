package com.getcapacitor.util;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Helper methods for parsing JSON objects.
 */
public class JSONUtils {

    /**
     * Get a string value from the given JSON object.
     *
     * @param jsonObject A JSON object to search
     * @param key A key to fetch from the JSON object
     * @param defaultValue A default value to return if the key cannot be found
     * @return The value at the given key in the JSON object, or the default value
     */
    public static String getString(JSONObject jsonObject, String key, String defaultValue) {
        String k = getDeepestKey(key);
        try {
            JSONObject o = getDeepestObject(jsonObject, key);

            String value = o.getString(k);
            if (value == null) {
                return defaultValue;
            }
            return value;
        } catch (JSONException ignore) {
            // value was not found
        }

        return defaultValue;
    }

    /**
     * Get a boolean value from the given JSON object.
     *
     * @param jsonObject A JSON object to search
     * @param key A key to fetch from the JSON object
     * @param defaultValue A default value to return if the key cannot be found
     * @return The value at the given key in the JSON object, or the default value
     */
    public static boolean getBoolean(JSONObject jsonObject, String key, boolean defaultValue) {
        String k = getDeepestKey(key);
        try {
            JSONObject o = getDeepestObject(jsonObject, key);

            return o.getBoolean(k);
        } catch (JSONException ignore) {
            // value was not found
        }

        return defaultValue;
    }

    /**
     * Get an int value from the given JSON object.
     *
     * @param jsonObject A JSON object to search
     * @param key A key to fetch from the JSON object
     * @param defaultValue A default value to return if the key cannot be found
     * @return The value at the given key in the JSON object, or the default value
     */
    public static int getInt(JSONObject jsonObject, String key, int defaultValue) {
        String k = getDeepestKey(key);
        try {
            JSONObject o = getDeepestObject(jsonObject, key);
            return o.getInt(k);
        } catch (JSONException ignore) {
            // value was not found
        }

        return defaultValue;
    }

    /**
     * Get a JSON object value from the given JSON object.
     *
     * @param jsonObject A JSON object to search
     * @param key A key to fetch from the JSON object
     * @return The value from the config, if exists. Null if not
     */
    public static JSONObject getObject(JSONObject jsonObject, String key) {
        String k = getDeepestKey(key);
        try {
            JSONObject o = getDeepestObject(jsonObject, key);

            return o.getJSONObject(k);
        } catch (JSONException ignore) {
            // value was not found
        }

        return null;
    }

    /**
     * Get a string array value from the given JSON object.
     *
     * @param jsonObject A JSON object to search
     * @param key A key to fetch from the JSON object
     * @param defaultValue A default value to return if the key cannot be found
     * @return The value at the given key in the JSON object, or the default value
     */
    public static String[] getArray(JSONObject jsonObject, String key, String[] defaultValue) {
        String k = getDeepestKey(key);
        try {
            JSONObject o = getDeepestObject(jsonObject, key);

            JSONArray a = o.getJSONArray(k);
            if (a == null) {
                return defaultValue;
            }

            int l = a.length();
            String[] value = new String[l];

            for (int i = 0; i < l; i++) {
                value[i] = (String) a.get(i);
            }

            return value;
        } catch (JSONException ignore) {
            // value was not found
        }

        return defaultValue;
    }

    /**
     * Given a JSON key path, gets the deepest key.
     *
     * @param key The key path
     * @return The deepest key
     */
    private static String getDeepestKey(String key) {
        String[] parts = key.split("\\.");
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }

        return null;
    }

    /**
     * Given a JSON object and key path, gets the deepest object in the path.
     *
     * @param jsonObject A JSON object
     * @param key The key path to follow
     * @return The deepest object along the key path
     * @throws JSONException Thrown if any JSON errors
     */
    private static JSONObject getDeepestObject(JSONObject jsonObject, String key) throws JSONException {
        String[] parts = key.split("\\.");
        JSONObject o = jsonObject;

        // Search until the second to last part of the key
        for (int i = 0; i < parts.length - 1; i++) {
            String k = parts[i];
            o = o.getJSONObject(k);
        }

        return o;
    }
}
