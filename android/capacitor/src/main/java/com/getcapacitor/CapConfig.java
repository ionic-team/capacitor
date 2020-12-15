package com.getcapacitor;

import static com.getcapacitor.Bridge.CAPACITOR_HTTP_SCHEME;
import static com.getcapacitor.FileUtils.readFile;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import com.getcapacitor.util.JSONUtils;
import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
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
    private Map<String, PluginConfig> pluginsConfiguration = null;

    // Config Object JSON (legacy)
    private JSONObject configJSON = new JSONObject();

    /**
     * Constructs an empty config file.
     */
    private CapConfig() {}

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
        html5mode = JSONUtils.getBoolean(configJSON, "server.html5mode", html5mode);
        serverUrl = JSONUtils.getString(configJSON, "server.url", null);
        hostname = JSONUtils.getString(configJSON, "server.hostname", hostname);
        androidScheme = JSONUtils.getString(configJSON, "server.androidScheme", androidScheme);
        allowNavigation = JSONUtils.getArray(configJSON, "server.allowNavigation", null);

        // Android
        overriddenUserAgentString =
            JSONUtils.getString(configJSON, "android.overrideUserAgent", JSONUtils.getString(configJSON, "overrideUserAgent", null));
        appendedUserAgentString =
            JSONUtils.getString(configJSON, "android.appendUserAgent", JSONUtils.getString(configJSON, "appendUserAgent", null));
        backgroundColor =
            JSONUtils.getString(configJSON, "android.backgroundColor", JSONUtils.getString(configJSON, "backgroundColor", null));
        allowMixedContent =
            JSONUtils.getBoolean(
                configJSON,
                "android.allowMixedContent",
                JSONUtils.getBoolean(configJSON, "allowMixedContent", allowMixedContent)
            );
        captureInput = JSONUtils.getBoolean(configJSON, "android.captureInput", captureInput);
        hideLogs = JSONUtils.getBoolean(configJSON, "android.hideLogs", JSONUtils.getBoolean(configJSON, "hideLogs", hideLogs));
        webContentsDebuggingEnabled = (context.getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        webContentsDebuggingEnabled = JSONUtils.getBoolean(configJSON, "android.webContentsDebuggingEnabled", webContentsDebuggingEnabled);

        // Plugins
        pluginsConfiguration = deserializePluginsConfig(JSONUtils.getObject(configJSON, "plugins"));
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

    public boolean isWebContentsDebuggingEnabled() {
        return webContentsDebuggingEnabled;
    }

    public boolean isLogsHidden() {
        return hideLogs;
    }

    public PluginConfig getPluginConfiguration(String pluginId) {
        PluginConfig pluginConfig = pluginsConfiguration.get(pluginId);
        if (pluginConfig == null) {
            pluginConfig = new PluginConfig(new JSONObject());
        }

        return pluginConfig;
    }

    /**
     * Get a JSON object value from the Capacitor config.
     * @deprecated use {@link PluginConfig#getObject(String)}  to access plugin config values.
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
     * @deprecated use {@link PluginConfig#getString(String, String)} to access plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @return The value from the config, if exists. Null if not
     */
    @Deprecated
    public String getString(String key) {
        return JSONUtils.getString(configJSON, key, null);
    }

    /**
     * Get a string value from the Capacitor config.
     * @deprecated use {@link PluginConfig#getString(String, String)} to access plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    @Deprecated
    public String getString(String key, String defaultValue) {
        return JSONUtils.getString(configJSON, key, defaultValue);
    }

    /**
     * Get a boolean value from the Capacitor config.
     * @deprecated use {@link PluginConfig#getBoolean(String, boolean)} to access plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    @Deprecated
    public boolean getBoolean(String key, boolean defaultValue) {
        return JSONUtils.getBoolean(configJSON, key, defaultValue);
    }

    /**
     * Get an integer value from the Capacitor config.
     * @deprecated use {@link PluginConfig#getInt(String, int)}  to access the plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    @Deprecated
    public int getInt(String key, int defaultValue) {
        return JSONUtils.getInt(configJSON, key, defaultValue);
    }

    /**
     * Get a string array value from the Capacitor config.
     * @deprecated use {@link PluginConfig#getArray(String)}  to access the plugin config
     * values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @return The value from the config, if exists. Null if not
     */
    @Deprecated
    public String[] getArray(String key) {
        return JSONUtils.getArray(configJSON, key, null);
    }

    /**
     * Get a string array value from the Capacitor config.
     * @deprecated use {@link PluginConfig#getArray(String, String[])}  to access the plugin
     * config values. For main Capacitor config values, use the appropriate getter.
     *
     * @param key A key to fetch from the config
     * @param defaultValue A default value to return if the key does not exist in the config
     * @return The value from the config, if key exists. Default value returned if not
     */
    @Deprecated
    public String[] getArray(String key, String[] defaultValue) {
        return JSONUtils.getArray(configJSON, key, defaultValue);
    }

    private static Map<String, PluginConfig> deserializePluginsConfig(JSONObject pluginsConfig) {
        Map<String, PluginConfig> pluginsMap = new HashMap<>();

        // return an empty map if there is no pluginsConfig json
        if (pluginsConfig == null) {
            return pluginsMap;
        }

        Iterator<String> pluginIds = pluginsConfig.keys();

        while (pluginIds.hasNext()) {
            String pluginId = pluginIds.next();
            JSONObject value = null;

            try {
                value = pluginsConfig.getJSONObject(pluginId);
                PluginConfig pluginConfig = new PluginConfig(value);
                pluginsMap.put(pluginId, pluginConfig);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return pluginsMap;
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
        private Map<String, PluginConfig> pluginsConfiguration = new HashMap<>();

        /**
         * Builds a Capacitor Config from the builder.
         *
         * @return A new Capacitor Config
         */
        public CapConfig create() {
            return new CapConfig(this);
        }

        public Builder setPluginsConfiguration(JSONObject pluginsConfiguration) {
            this.pluginsConfiguration = deserializePluginsConfig(pluginsConfiguration);
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

        public Builder setLogsHidden(boolean hideLogs) {
            this.hideLogs = hideLogs;
            return this;
        }
    }
}
