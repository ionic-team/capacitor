package com.getcapacitor;

import static com.getcapacitor.Bridge.CAPACITOR_HTTP_SCHEME;

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
    private Boolean webContentsDebuggingEnabled;
    private boolean hideLogs = false;

    private JSONObject configJSON = new JSONObject();

    /**
     * Constructs a Capacitor Configuration from file
     *
     * @param assetManager
     * @param defaultDebuggable
     */
    public CapConfig(AssetManager assetManager, boolean defaultDebuggable) {
        this.webContentsDebuggingEnabled = defaultDebuggable;

        // Load capacitor.config.json
        loadConfig(assetManager);
        deserializeConfig();
    }

    /**
     * Constructs a Capacitor Configuration using ConfigBuilder
     *
     * @param builder
     */
    private CapConfig(ConfigBuilder builder) {
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
            this.configJSON = new JSONObject(jsonString);
        } catch (IOException ex) {
            Logger.error("Unable to load capacitor.config.json. Run npx cap copy first", ex);
        } catch (JSONException ex) {
            Logger.error("Unable to parse capacitor.config.json. Make sure it's valid json", ex);
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {}
            }
        }
    }

    private void deserializeConfig() {
        // Server
        html5mode = getBoolean("server.html5mode", html5mode);
        serverUrl = getString("server.url");
        hostname = getString("server.hostname", hostname);
        androidScheme = getString("server.androidScheme", androidScheme);
        allowNavigation = getArray("server.allowNavigation");

        // Android
        overriddenUserAgentString = getString("android.overrideUserAgent", getString("overrideUserAgent"));
        appendedUserAgentString = getString("android.appendUserAgent", getString("appendUserAgent"));
        backgroundColor = getString("android.backgroundColor", getString("backgroundColor"));
        allowMixedContent = getBoolean("android.allowMixedContent", getBoolean("allowMixedContent", allowMixedContent));
        captureInput = getBoolean("android.captureInput", captureInput);
        webContentsDebuggingEnabled = getBoolean("android.webContentsDebuggingEnabled", webContentsDebuggingEnabled);
        hideLogs = getBoolean("android.hideLogs", getBoolean("hideLogs", hideLogs));
    }

    public boolean html5mode() {
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

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public boolean allowMixedContent() {
        return allowMixedContent;
    }

    public boolean captureInput() {
        return captureInput;
    }

    public Boolean getWebContentsDebuggingEnabled() {
        return webContentsDebuggingEnabled;
    }

    public boolean hideLogs() {
        return hideLogs;
    }

    public JSONObject getObject(String key) {
        try {
            return this.configJSON.getJSONObject(key);
        } catch (Exception ex) {}
        return null;
    }

    private JSONObject getConfigObjectDeepest(String key) throws JSONException {
        // Split on periods
        String[] parts = key.split("\\.");

        JSONObject o = this.configJSON;
        // Search until the second to last part of the key
        for (int i = 0; i < parts.length - 1; i++) {
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

            for (int i = 0; i < l; i++) {
                value[i] = (String) a.get(i);
            }

            return value;
        } catch (Exception ex) {}
        return defaultValue;
    }

    /**
     * Builds a Capacitor Configuration in code
     */
    public static class ConfigBuilder {

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
        private Boolean webContentsDebuggingEnabled;
        private boolean hideLogs = false;

        public CapConfig build() {
            return new CapConfig(this);
        }

        public ConfigBuilder html5mode(boolean html5mode) {
            this.html5mode = html5mode;
            return this;
        }

        public ConfigBuilder serverUrl(String serverUrl) {
            this.serverUrl = serverUrl;
            return this;
        }

        public ConfigBuilder hostname(String hostname) {
            this.hostname = hostname;
            return this;
        }

        public ConfigBuilder androidScheme(String androidScheme) {
            this.androidScheme = androidScheme;
            return this;
        }

        public ConfigBuilder allowNavigation(String[] allowNavigation) {
            this.allowNavigation = allowNavigation;
            return this;
        }

        public ConfigBuilder overriddenUserAgentString(String overriddenUserAgentString) {
            this.overriddenUserAgentString = overriddenUserAgentString;
            return this;
        }

        public ConfigBuilder appendedUserAgentString(String appendedUserAgentString) {
            this.appendedUserAgentString = appendedUserAgentString;
            return this;
        }

        public ConfigBuilder backgroundColor(String backgroundColor) {
            this.backgroundColor = backgroundColor;
            return this;
        }

        public ConfigBuilder allowMixedContent(boolean allowMixedContent) {
            this.allowMixedContent = allowMixedContent;
            return this;
        }

        public ConfigBuilder captureInput(boolean captureInput) {
            this.captureInput = captureInput;
            return this;
        }

        public ConfigBuilder webContentsDebuggingEnabled(Boolean webContentsDebuggingEnabled) {
            this.webContentsDebuggingEnabled = webContentsDebuggingEnabled;
            return this;
        }

        public ConfigBuilder hideLogs(boolean hideLogs) {
            this.hideLogs = hideLogs;
            return this;
        }
    }
}
