package com.getcapacitor;

import com.getcapacitor.util.JSONUtils;
import org.json.JSONObject;

/**
 * Represents the configuration options for plugins used by Capacitor
 */
public class PluginConfig {

    /**
     * The object containing plugin config values.
     */
    private final JSONObject config;

    /**
     * Constructs a PluginsConfig with the provided JSONObject value.
     *
     * @param config A plugin configuration expressed as a JSON Object
     */
    PluginConfig(JSONObject config) {
        this.config = config;
    }

    /**
     * Get a string value for a plugin in the Capacitor config.
     *
     * @param configKey The key of the value to retrieve
     * @return The value from the config, if exists. Null if not
     */
    public String getString(String configKey) {
        return getString(configKey, null);
    }

    /**
     * Get a string value for a plugin in the Capacitor config.
     *
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public String getString(String configKey, String defaultValue) {
        return JSONUtils.getString(config, configKey, defaultValue);
    }

    /**
     * Get a boolean value for a plugin in the Capacitor config.
     *
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public boolean getBoolean(String configKey, boolean defaultValue) {
        return JSONUtils.getBoolean(config, configKey, defaultValue);
    }

    /**
     * Get an integer value for a plugin in the Capacitor config.
     *
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public int getInt(String configKey, int defaultValue) {
        return JSONUtils.getInt(config, configKey, defaultValue);
    }

    /**
     * Get a string array value for a plugin in the Capacitor config.
     *
     * @param configKey The key of the value to retrieve
     * @return The value from the config, if exists. Null if not
     */
    public String[] getArray(String configKey) {
        return getArray(configKey, null);
    }

    /**
     * Get a string array value for a plugin in the Capacitor config.
     *
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public String[] getArray(String configKey, String[] defaultValue) {
        return JSONUtils.getArray(config, configKey, defaultValue);
    }

    /**
     * Get a JSON object value for a plugin in the Capacitor config.
     *
     * @param configKey The key of the value to retrieve
     * @return The value from the config, if exists. Null if not
     */
    public JSONObject getObject(String configKey) {
        return JSONUtils.getObject(config, configKey);
    }

    /**
     * Check if the PluginConfig is empty.
     *
     * @return true if the plugin config has no entries
     */
    public boolean isEmpty() {
        return config.length() == 0;
    }

    /**
     * Gets the JSON Object containing the config of the the provided plugin ID.
     *
     * @return The config for that plugin
     */
    public JSONObject getConfigJSON() {
        return config;
    }
}
