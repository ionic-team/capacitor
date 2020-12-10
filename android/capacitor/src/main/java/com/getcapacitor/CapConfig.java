package com.getcapacitor;

import static com.getcapacitor.Bridge.CAPACITOR_HTTP_SCHEME;
import static com.getcapacitor.FileUtils.readFile;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.res.AssetManager;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Represents the configuration options for Capacitor
 */
public class CapConfig {

    // Server Config
    private boolean html5mode = true;
    private String serverUrl;
    private String hostname = "localhost";
    private String androidScheme = CAPACITOR_HTTP_SCHEME;
    private String[] allowNavigation;

    // Android Config
    private String overriddenUserAgentString;
    private String appendedUserAgentString;
    private String backgroundColor;
    private boolean allowMixedContent = false;
    private boolean captureInput = false;
    private boolean webContentsDebuggingEnabled = false;
    private boolean hideLogs = false;

    // Plugins
    private JSONObject pluginsConfiguration = new JSONObject();

    // Config Object JSON (legacy)
    private JSONObject configJSON = new JSONObject();

    /**
     * Constructs a Capacitor Configuration from config.json file.
     *
     * @param context The context.
     * @return A loaded config file, if successful.
     */
    static CapConfig fromFile(Context context) {
        CapConfig config = new CapConfig();

        if (context == null) {
            Logger.error("Capacitor Config could not be created from file. Context must not be null.");
            return config;
        }

        config.loadConfig(context);
        config.deserializeConfig(context);
        return config;
    }

    /**
     * Constructs an empty config file.
     */
    private CapConfig() {}

    /**
     * Constructs a Capacitor Configuration using ConfigBuilder.
     *
     * @param builder A config builder initialized with values
     */
    private CapConfig(Builder builder) {
        // Server Config
        this.html5mode = builder.html5mode;
        this.serverUrl = builder.serverUrl;
        this.hostname = builder.hostname;
        this.androidScheme = builder.androidScheme;
        this.allowNavigation = builder.allowNavigation;

        // Android Config
        this.overriddenUserAgentString = builder.overriddenUserAgentString;
        this.appendedUserAgentString = builder.appendedUserAgentString;
        this.backgroundColor = builder.backgroundColor;
        this.allowMixedContent = builder.allowMixedContent;
        this.captureInput = builder.captureInput;
        this.webContentsDebuggingEnabled = builder.webContentsDebuggingEnabled;
        this.hideLogs = builder.hideLogs;

        // Plugins Config
        this.pluginsConfiguration = builder.pluginsConfiguration;
    }

    /**
     * Loads a Capacitor Configuration JSON file into a Capacitor Configuration object.
     */
    private void loadConfig(Context context) {
        try {
            String jsonString = readFile(context, "capacitor.config.json");
            configJSON = new JSONObject(jsonString);
        } catch (IOException ex) {
            Logger.error("Unable to load capacitor.config.json. Run npx cap copy first", ex);
        } catch (JSONException ex) {
            Logger.error("Unable to parse capacitor.config.json. Make sure it's valid json", ex);
        }
    }

    /**
     * Deserializes the config from JSON into a Capacitor Configuration object.
     */
    private void deserializeConfig(Context context) {
        // Server
        html5mode = getBoolean(configJSON, "server.html5mode", html5mode);
        serverUrl = getString(configJSON, "server.url", null);
        hostname = getString(configJSON, "server.hostname", hostname);
        androidScheme = getString(configJSON, "server.androidScheme", androidScheme);
        allowNavigation = getArray(configJSON, "server.allowNavigation", null);

        // Android
        overriddenUserAgentString = getString(configJSON, "android.overrideUserAgent", getString(configJSON, "overrideUserAgent", null));
        appendedUserAgentString = getString(configJSON, "android.appendUserAgent", getString(configJSON, "appendUserAgent", null));
        backgroundColor = getString(configJSON, "android.backgroundColor", getString(configJSON, "backgroundColor", null));
        allowMixedContent =
            getBoolean(configJSON, "android.allowMixedContent", getBoolean(configJSON, "allowMixedContent", allowMixedContent));
        captureInput = getBoolean(configJSON, "android.captureInput", captureInput);
        hideLogs = getBoolean(configJSON, "android.hideLogs", getBoolean(configJSON, "hideLogs", hideLogs));
        webContentsDebuggingEnabled = (context.getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        webContentsDebuggingEnabled = getBoolean(configJSON, "android.webContentsDebuggingEnabled", webContentsDebuggingEnabled);

        // Plugins
        pluginsConfiguration = getObject(configJSON, "plugins");
    }

    public boolean isHTML5Mode() {
        return html5mode;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public String getHostname() {
        return hostname;
    }

    public String getAndroidScheme() {
        return androidScheme;
    }

    public String[] getAllowNavigation() {
        return allowNavigation;
    }

    public String getOverriddenUserAgentString() {
        return overriddenUserAgentString;
    }

    public String getAppendedUserAgentString() {
        return appendedUserAgentString;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public boolean isMixedContentAllowed() {
        return allowMixedContent;
    }

    public boolean isInputCaptured() {
        return captureInput;
    }

    public Boolean getWebContentsDebuggingEnabled() {
        return webContentsDebuggingEnabled;
    }

    public boolean areLogsHidden() {
        return hideLogs;
    }

    public JSONObject getPluginsConfiguration() {
        return pluginsConfiguration;
    }

    /**
     * Get a string value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @return The value from the config, if exists. Null if not
     */
    public String getPluginString(String pluginId, String configKey) {
        return getPluginString(pluginId, configKey, null);
    }

    /**
     * Get a string value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public String getPluginString(String pluginId, String configKey, String defaultValue) {
        String keyPath = String.format("%s.%s", pluginId, configKey);
        return getString(pluginsConfiguration, keyPath, defaultValue);
    }

    /**
     * Get a boolean value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public boolean getPluginBoolean(String pluginId, String configKey, boolean defaultValue) {
        String keyPath = String.format("%s.%s", pluginId, configKey);
        return getBoolean(pluginsConfiguration, keyPath, defaultValue);
    }

    /**
     * Get an integer value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public int getPluginInt(String pluginId, String configKey, int defaultValue) {
        String keyPath = String.format("%s.%s", pluginId, configKey);
        return getInt(pluginsConfiguration, keyPath, defaultValue);
    }

    /**
     * Get a string array value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @return The value from the config, if exists. Null if not
     */
    public String[] getPluginArray(String pluginId, String configKey) {
        return getPluginArray(pluginId, configKey, null);
    }

    /**
     * Get a string array value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    public String[] getPluginArray(String pluginId, String configKey, String[] defaultValue) {
        String keyPath = String.format("%s.%s", pluginId, configKey);
        return getArray(pluginsConfiguration, keyPath, defaultValue);
    }

    /**
     * Get a JSON object value for a plugin in the Capacitor config.
     *
     * @param pluginId The ID of the plugin used in the config
     * @param configKey The key of the value to retrieve
     * @return The value from the config, if exists. Null if not
     */
    public JSONObject getPluginObject(String pluginId, String configKey) {
        return getObject(pluginsConfiguration, String.format("%s.%s", pluginId, configKey));
    }

    /**
     * Get a JSON object value from the Capacitor config.
     * @deprecated use {@link #getPluginObject(String, String)} to access plugin config values.
     * For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @return The value from the config, if exists. Null if not
     */
    @Deprecated
    public JSONObject getObject(String key) {
        try {
            return configJSON.getJSONObject(key);
        } catch (Exception ex) {}
        return null;
    }

    /**
     * Get a string value from the Capacitor config.
     * @deprecated use {@link #getPluginString(String, String)} to access plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @return The value from the config, if exists. Null if not
     */
    @Deprecated
    public String getString(String key) {
        return getString(configJSON, key, null);
    }

    /**
     * Get a string value from the Capacitor config.
     * @deprecated use {@link #getPluginString(String, String, String)} to access plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    @Deprecated
    public String getString(String key, String defaultValue) {
        return getString(configJSON, key, defaultValue);
    }

    /**
     * Get a boolean value from the Capacitor config.
     * @deprecated use {@link #getPluginBoolean(String, String, boolean)} to access plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    @Deprecated
    public boolean getBoolean(String key, boolean defaultValue) {
        return getBoolean(configJSON, key, defaultValue);
    }

    /**
     * Get an integer value from the Capacitor config.
     * @deprecated use {@link #getPluginInt(String, String, int)} to access the plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    @Deprecated
    public int getInt(String key, int defaultValue) {
        return getInt(configJSON, key, defaultValue);
    }

    /**
     * Get a string array value from the Capacitor config.
     * @deprecated use {@link #getPluginArray(String, String)} to access the plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @return The value from the config, if exists. Null if not
     */
    @Deprecated
    public String[] getArray(String key) {
        return getArray(configJSON, key, null);
    }

    /**
     * Get a string array value from the Capacitor config.
     * @deprecated use {@link #getPluginArray(String, String, String[])} to access the plugin
     * config values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    @Deprecated
    public String[] getArray(String key, String[] defaultValue) {
        return getArray(configJSON, key, defaultValue);
    }

    /**
     * Get a string value from the given JSON object.
     *
     * @param jsonObject A JSON object to search
     * @param key A key to fetch from the JSON object
     * @param defaultValue A default value to return if the key cannot be found
     * @return The value at the given key in the JSON object, or the default value
     */
    private String getString(JSONObject jsonObject, String key, String defaultValue) {
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
    private boolean getBoolean(JSONObject jsonObject, String key, boolean defaultValue) {
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
    private int getInt(JSONObject jsonObject, String key, int defaultValue) {
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
     * Get a string array value from the given JSON object.
     *
     * @param jsonObject A JSON object to search
     * @param key A key to fetch from the JSON object
     * @param defaultValue A default value to return if the key cannot be found
     * @return The value at the given key in the JSON object, or the default value
     */
    private String[] getArray(JSONObject jsonObject, String key, String[] defaultValue) {
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
     * Get a JSON object value from the given JSON object.
     *
     * @param jsonObject A JSON object to search
     * @param key A key to fetch from the JSON object
     * @return The value from the config, if exists. Null if not
     */
    private JSONObject getObject(JSONObject jsonObject, String key) {
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
     * Given a JSON key path, gets the deepest key.
     *
     * @param key The key path
     * @return The deepest key
     */
    private String getDeepestKey(String key) {
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
    private JSONObject getDeepestObject(JSONObject jsonObject, String key) throws JSONException {
        String[] parts = key.split("\\.");
        JSONObject o = jsonObject;

        // Search until the second to last part of the key
        for (int i = 0; i < parts.length - 1; i++) {
            String k = parts[i];
            o = o.getJSONObject(k);
        }

        return o;
    }

    /**
     * Builds a Capacitor Configuration in code
     */
    public static class Builder {

        // Server Config Values
        private boolean html5mode = true;
        private String serverUrl;
        private String hostname = "localhost";
        private String androidScheme = CAPACITOR_HTTP_SCHEME;
        private String[] allowNavigation;

        // Android Config Values
        private String overriddenUserAgentString;
        private String appendedUserAgentString;
        private String backgroundColor;
        private boolean allowMixedContent = false;
        private boolean captureInput = false;
        private boolean webContentsDebuggingEnabled = false;
        private boolean hideLogs = false;

        // Plugins Config Object
        private JSONObject pluginsConfiguration = new JSONObject();

        /**
         * Builds a Capacitor Config from the builder.
         *
         * @return A new Capacitor Config
         */
        public CapConfig create() {
            return new CapConfig(this);
        }

        public Builder setPluginsConfiguration(JSONObject pluginsConfiguration) {
            this.pluginsConfiguration = pluginsConfiguration;
            return this;
        }

        public Builder setHTML5mode(boolean html5mode) {
            this.html5mode = html5mode;
            return this;
        }

        public Builder setServerUrl(String serverUrl) {
            this.serverUrl = serverUrl;
            return this;
        }

        public Builder setHostname(String hostname) {
            this.hostname = hostname;
            return this;
        }

        public Builder setAndroidScheme(String androidScheme) {
            this.androidScheme = androidScheme;
            return this;
        }

        public Builder setAllowNavigation(String[] allowNavigation) {
            this.allowNavigation = allowNavigation;
            return this;
        }

        public Builder setOverriddenUserAgentString(String overriddenUserAgentString) {
            this.overriddenUserAgentString = overriddenUserAgentString;
            return this;
        }

        public Builder setAppendedUserAgentString(String appendedUserAgentString) {
            this.appendedUserAgentString = appendedUserAgentString;
            return this;
        }

        public Builder setBackgroundColor(String backgroundColor) {
            this.backgroundColor = backgroundColor;
            return this;
        }

        public Builder setAllowMixedContent(boolean allowMixedContent) {
            this.allowMixedContent = allowMixedContent;
            return this;
        }

        public Builder setCaptureInput(boolean captureInput) {
            this.captureInput = captureInput;
            return this;
        }

        public Builder setWebContentsDebuggingEnabled(boolean webContentsDebuggingEnabled) {
            this.webContentsDebuggingEnabled = webContentsDebuggingEnabled;
            return this;
        }

        public Builder setHideLogs(boolean hideLogs) {
            this.hideLogs = hideLogs;
            return this;
        }
    }
}
