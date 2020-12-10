package com.getcapacitor;

import org.json.JSONObject;

/**
 * Represents the configuration options for plugins used by Capacitor
 */
public class PluginsConfig {

    /**
     * The object containing plugin config values.
     */
    private final JSONObject config;

    /**
     * Constructs a PluginsConfig with the provided JSONObject value.
     *
     * @param config A plugin configuration expressed as a JSON Object
     */
    PluginsConfig(JSONObject config) {
        this.config = config;
    }

    /**
     * Get a string value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @return The value from the config, if exists. Null if not
     */
    public String getString(String pluginId, String configKey) {
        return getString(pluginId, configKey, null);
    }

    /**
     * Get a string value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public String getString(String pluginId, String configKey, String defaultValue) {
        String keyPath = String.format("%s.%s", pluginId, configKey);
        return JSONUtils.getString(config, keyPath, defaultValue);
    }

    /**
     * Get a boolean value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public boolean getBoolean(String pluginId, String configKey, boolean defaultValue) {
        String keyPath = String.format("%s.%s", pluginId, configKey);
        return JSONUtils.getBoolean(config, keyPath, defaultValue);
    }

    /**
     * Get an integer value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public int getInt(String pluginId, String configKey, int defaultValue) {
        String keyPath = String.format("%s.%s", pluginId, configKey);
        return JSONUtils.getInt(config, keyPath, defaultValue);
    }

    /**
     * Get a string array value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @return The value from the config, if exists. Null if not
     */
    public String[] getArray(String pluginId, String configKey) {
        return getArray(pluginId, configKey, null);
    }

    /**
     * Get a string array value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public String[] getArray(String pluginId, String configKey, String[] defaultValue) {
        String keyPath = String.format("%s.%s", pluginId, configKey);
        return JSONUtils.getArray(config, keyPath, defaultValue);
    }

    /**
     * Get a JSON object value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @return The value from the config, if exists. Null if not
     */
    public JSONObject getObject(String pluginId, String configKey) {
        return JSONUtils.getObject(config, String.format("%s.%s", pluginId, configKey));
    }

    /**
     * Gets the JSON Object containing the config of the the provided plugin ID.
     *
     * @param pluginId The plugin ID
     * @return The config for that plugin
     */
    public JSONObject getPluginConfig(String pluginId) {
        return JSONUtils.getObject(config, pluginId);
    }
}
