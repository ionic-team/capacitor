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
 * Management interface for accessing values in capacitor.config.json
 */
public class CapConfig {

    // Server Config Values
    private boolean html5mode = true;
    private String serverUrl;
    private String hostname = "localhost";
    private String androidScheme = CAPACITOR_HTTP_SCHEME;
    private String[] allowNagivation;

    // Android Config Values
    private String overriddenUserAgentString;
    private String appendedUserAgentString;
    private String backgroundColor;
    private boolean allowMixedContent = false;
    private boolean captureInput = false;
    private Boolean webContentsDebuggingEnabled;
    private boolean hideLogs = false;

    private JSONObject configJSON = new JSONObject();

    public CapConfig() {}

    public CapConfig(AssetManager assetManager, boolean defaultDebuggable) {
        this.webContentsDebuggingEnabled = defaultDebuggable;

        // Load capacitor.config.json
        loadConfig(assetManager);
        deserializeConfig();
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
        allowNagivation = getArray("server.allowNavigation");

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

    public void setHtml5mode(boolean html5mode) {
        this.html5mode = html5mode;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getAndroidScheme() {
        return androidScheme;
    }

    public void setAndroidScheme(String androidScheme) {
        this.androidScheme = androidScheme;
    }

    public String[] getAllowNagivation() {
        return allowNagivation;
    }

    public void setAllowNagivation(String[] allowNagivation) {
        this.allowNagivation = allowNagivation;
    }

    public String getOverriddenUserAgentString() {
        return overriddenUserAgentString;
    }

    public void setOverriddenUserAgentString(String overriddenUserAgentString) {
        this.overriddenUserAgentString = overriddenUserAgentString;
    }

    public String getAppendedUserAgentString() {
        return appendedUserAgentString;
    }

    public void setAppendedUserAgentString(String appendedUserAgentString) {
        this.appendedUserAgentString = appendedUserAgentString;
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

    public void setAllowMixedContent(boolean allowMixedContent) {
        this.allowMixedContent = allowMixedContent;
    }

    public boolean captureInput() {
        return captureInput;
    }

    public void setCaptureInput(boolean captureInput) {
        this.captureInput = captureInput;
    }

    public Boolean getWebContentsDebuggingEnabled() {
        return webContentsDebuggingEnabled;
    }

    public void setWebContentsDebuggingEnabled(Boolean webContentsDebuggingEnabled) {
        this.webContentsDebuggingEnabled = webContentsDebuggingEnabled;
    }

    public boolean hideLogs() {
        return hideLogs;
    }

    public void setHideLogs(boolean hideLogs) {
        this.hideLogs = hideLogs;
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
}
