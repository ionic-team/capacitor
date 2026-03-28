package com.getcapacitor;

import androidx.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Wraps a call from the web layer to native
 */
public class PluginCall {

    /**
     * A special callback id that indicates there is no matching callback
     * on the client to associate any PluginCall results back to. This is used
     * in the case of an app resuming with saved instance data, for example.
     */
    public static final String CALLBACK_ID_DANGLING = "-1";

    private final MessageHandler msgHandler;
    private final String pluginId;
    private final String callbackId;
    private final String methodName;
    private final JSObject data;

    private boolean keepAlive = false;

    /**
     * Indicates that this PluginCall was released, and should no longer be used
     */
    @Deprecated
    private boolean isReleased = false;

    public PluginCall(MessageHandler msgHandler, String pluginId, String callbackId, String methodName, JSObject data) {
        this.msgHandler = msgHandler;
        this.pluginId = pluginId;
        this.callbackId = callbackId;
        this.methodName = methodName;
        this.data = data;
    }

    public void successCallback(PluginResult successResult) {
        if (CALLBACK_ID_DANGLING.equals(this.callbackId)) {
            // don't send back response if the callbackId was "-1"
            return;
        }

        this.msgHandler.sendResponseMessage(this, successResult, null);
    }

    public void resolve(JSObject data) {
        PluginResult result = new PluginResult(data);
        this.msgHandler.sendResponseMessage(this, result, null);
    }

    public void resolve() {
        this.msgHandler.sendResponseMessage(this, null, null);
    }

    public void errorCallback(String msg) {
        PluginResult errorResult = new PluginResult();

        try {
            errorResult.put("message", msg);
        } catch (Exception jsonEx) {
            Logger.error(Logger.tags("Plugin"), jsonEx.toString(), null);
        }

        this.msgHandler.sendResponseMessage(this, null, errorResult);
    }

    public void reject(String msg, String code, Exception ex, JSObject data) {
        PluginResult errorResult = new PluginResult();

        if (ex != null) {
            Logger.error(Logger.tags("Plugin"), msg, ex);
        }

        try {
            errorResult.put("message", msg);
            errorResult.put("code", code);
            if (null != data) {
                errorResult.put("data", data);
            }
        } catch (Exception jsonEx) {
            Logger.error(Logger.tags("Plugin"), jsonEx.getMessage(), jsonEx);
        }

        this.msgHandler.sendResponseMessage(this, null, errorResult);
    }

    public void reject(String msg, Exception ex, JSObject data) {
        reject(msg, null, ex, data);
    }

    public void reject(String msg, String code, JSObject data) {
        reject(msg, code, null, data);
    }

    public void reject(String msg, String code, Exception ex) {
        reject(msg, code, ex, null);
    }

    public void reject(String msg, JSObject data) {
        reject(msg, null, null, data);
    }

    public void reject(String msg, Exception ex) {
        reject(msg, null, ex, null);
    }

    public void reject(String msg, String code) {
        reject(msg, code, null, null);
    }

    public void reject(String msg) {
        reject(msg, null, null, null);
    }

    public void unimplemented() {
        unimplemented("not implemented");
    }

    public void unimplemented(String msg) {
        reject(msg, "UNIMPLEMENTED", null, null);
    }

    public void unavailable() {
        unavailable("not available");
    }

    public void unavailable(String msg) {
        reject(msg, "UNAVAILABLE", null, null);
    }

    public String getPluginId() {
        return this.pluginId;
    }

    public String getCallbackId() {
        return this.callbackId;
    }

    public String getMethodName() {
        return this.methodName;
    }

    public JSObject getData() {
        return this.data;
    }

    @Nullable
    public String getString(String name) {
        return this.getString(name, null);
    }

    @Nullable
    public String getString(String name, @Nullable String defaultValue) {
        Object value = this.data.opt(name);
        if (value == null) {
            return defaultValue;
        }

        if (value instanceof String) {
            return (String) value;
        }
        return defaultValue;
    }

    @Nullable
    public Integer getInt(String name) {
        return this.getInt(name, null);
    }

    @Nullable
    public Integer getInt(String name, @Nullable Integer defaultValue) {
        Object value = this.data.opt(name);
        if (value == null) {
            return defaultValue;
        }

        if (value instanceof Integer) {
            return (Integer) value;
        }
        return defaultValue;
    }

    @Nullable
    public Long getLong(String name) {
        return this.getLong(name, null);
    }

    @Nullable
    public Long getLong(String name, @Nullable Long defaultValue) {
        Object value = this.data.opt(name);
        if (value == null) {
            return defaultValue;
        }

        if (value instanceof Long) {
            return (Long) value;
        }
        return defaultValue;
    }

    @Nullable
    public Float getFloat(String name) {
        return this.getFloat(name, null);
    }

    @Nullable
    public Float getFloat(String name, @Nullable Float defaultValue) {
        Object value = this.data.opt(name);
        if (value == null) {
            return defaultValue;
        }

        if (value instanceof Float) {
            return (Float) value;
        }
        if (value instanceof Double) {
            return ((Double) value).floatValue();
        }
        if (value instanceof Integer) {
            return ((Integer) value).floatValue();
        }
        return defaultValue;
    }

    @Nullable
    public Double getDouble(String name) {
        return this.getDouble(name, null);
    }

    @Nullable
    public Double getDouble(String name, @Nullable Double defaultValue) {
        Object value = this.data.opt(name);
        if (value == null) {
            return defaultValue;
        }

        if (value instanceof Double) {
            return (Double) value;
        }
        if (value instanceof Float) {
            return ((Float) value).doubleValue();
        }
        if (value instanceof Integer) {
            return ((Integer) value).doubleValue();
        }
        return defaultValue;
    }

    @Nullable
    public Boolean getBoolean(String name) {
        return this.getBoolean(name, null);
    }

    @Nullable
    public Boolean getBoolean(String name, @Nullable Boolean defaultValue) {
        Object value = this.data.opt(name);
        if (value == null) {
            return defaultValue;
        }

        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return defaultValue;
    }

    public JSObject getObject(String name) {
        return this.getObject(name, null);
    }

    @Nullable
    public JSObject getObject(String name, JSObject defaultValue) {
        Object value = this.data.opt(name);
        if (value == null) {
            return defaultValue;
        }

        if (value instanceof JSONObject) {
            try {
                return JSObject.fromJSONObject((JSONObject) value);
            } catch (JSONException ex) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    public JSArray getArray(String name) {
        return this.getArray(name, null);
    }

    /**
     * Get a JSONArray and turn it into a JSArray
     * @param name
     * @param defaultValue
     * @return
     */
    @Nullable
    public JSArray getArray(String name, JSArray defaultValue) {
        Object value = this.data.opt(name);
        if (value == null) {
            return defaultValue;
        }

        if (value instanceof JSONArray) {
            try {
                JSONArray valueArray = (JSONArray) value;
                List<Object> items = new ArrayList<>();
                for (int i = 0; i < valueArray.length(); i++) {
                    items.add(valueArray.get(i));
                }
                return new JSArray(items.toArray());
            } catch (JSONException ex) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    /**
     * @param name of the option to check
     * @return boolean indicating if the plugin call has an option for the provided name.
     * @deprecated Presence of a key should not be considered significant.
     * Use typed accessors to check the value instead.
     */
    @Deprecated
    public boolean hasOption(String name) {
        return this.data.has(name);
    }

    /**
     * Indicate that the Bridge should cache this call in order to call
     * it again later. For example, the addListener system uses this to
     * continuously call the call's callback (😆).
     * @deprecated use {@link #setKeepAlive(Boolean)} instead
     */
    @Deprecated
    public void save() {
        setKeepAlive(true);
    }

    /**
     * Indicate that the Bridge should cache this call in order to call
     * it again later. For example, the addListener system uses this to
     * continuously call the call's callback.
     *
     * @param keepAlive whether to keep the callback saved
     */
    public void setKeepAlive(Boolean keepAlive) {
        this.keepAlive = keepAlive;
    }

    public void release(Bridge bridge) {
        this.keepAlive = false;
        bridge.releaseCall(this);
        this.isReleased = true;
    }

    /**
     * @deprecated use {@link #isKeptAlive()}
     * @return true if the plugin call is kept alive
     */
    @Deprecated
    public boolean isSaved() {
        return isKeptAlive();
    }

    /**
     * Gets the keepAlive value of the plugin call
     * @return true if the plugin call is kept alive
     */
    public boolean isKeptAlive() {
        return keepAlive;
    }

    @Deprecated
    public boolean isReleased() {
        return isReleased;
    }

    /**
     * Resolve with binary data as a blob URL (more efficient than base64)
     * @param data Binary data to return
     * @param mimeType MIME type of the data
     */
    public void resolveWithBlob(byte[] data, String mimeType) {
        JSObject blobResponse = BlobStore.getInstance().createBlobResponse(data, mimeType);
        if (blobResponse == null) {
            reject("Failed to create blob storage");
            return;
        }
        resolve(blobResponse);
    }

    /**
     * Resolve with binary data as a blob URL with additional data fields
     * @param data Binary data to return
     * @param mimeType MIME type of the data
     * @param additionalData Additional fields to include in response
     */
    public void resolveWithBlob(byte[] data, String mimeType, JSObject additionalData) {
        JSObject blobResponse = BlobStore.getInstance().createBlobResponse(data, mimeType);
        if (blobResponse == null) {
            reject("Failed to create blob storage");
            return;
        }

        // Merge additional data
        if (additionalData != null) {
            try {
                for (java.util.Iterator<String> it = additionalData.keys(); it.hasNext();) {
                    String key = it.next();
                    blobResponse.put(key, additionalData.get(key));
                }
            } catch (Exception e) {
                Logger.error(Logger.tags("Plugin"), "Error merging additional data", e);
            }
        }

        resolve(blobResponse);
    }

    /**
     * Get binary data from a blob URL parameter (from JavaScript blob)
     * @param key The parameter key containing the blob URL
     * @param callback Called with the fetched data and mime type
     */
    public void getBlobData(String key, BlobDataCallback callback) {
        String blobUrl = getString(key);
        if (blobUrl == null) {
            callback.onError("Missing or invalid blob URL parameter: " + key);
            return;
        }

        // Check if this is a Capacitor blob (already in our store)
        if (blobUrl.startsWith("blob:capacitor://")) {
            BlobStore.BlobData blobData = BlobStore.getInstance().retrieve(blobUrl);
            if (blobData != null) {
                callback.onSuccess(blobData.data, blobData.mimeType);
            } else {
                callback.onError("Blob not found in store");
            }
            return;
        }

        // Otherwise, it's a browser blob URL - fetch it from the webview
        Bridge bridge = msgHandler.getBridge();
        if (bridge == null || bridge.getWebView() == null) {
            callback.onError("WebView not available");
            return;
        }

        BlobStore.getInstance().fetchWebViewBlob(blobUrl, bridge.getWebView(), new BlobStore.BlobFetchCallback() {
            @Override
            public void onSuccess(byte[] data, String mimeType) {
                callback.onSuccess(data, mimeType);
            }

            @Override
            public void onError(String error) {
                callback.onError(error);
            }
        });
    }

    /**
     * Callback interface for getBlobData
     */
    public interface BlobDataCallback {
        void onSuccess(byte[] data, String mimeType);
        void onError(String error);
    }

    class PluginCallDataTypeException extends Exception {

        PluginCallDataTypeException(String m) {
            super(m);
        }
    }
}
