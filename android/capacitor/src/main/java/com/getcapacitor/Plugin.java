package com.getcapacitor;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.util.PermissionHelper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Plugin is the base class for all plugins, containing a number of
 * convenient features for interacting with the {@link Bridge}, managing
 * plugin permissions, tracking lifecycle events, and more.
 *
 * You should inherit from this class when creating new plugins, along with
 * adding the {@link CapacitorPlugin} annotation to add additional required
 * metadata about the Plugin
 */
public class Plugin {

    // The key we will use inside of a persisted Bundle for the JSON blob
    // for a plugin call options.
    private static final String BUNDLE_PERSISTED_OPTIONS_JSON_KEY = "_json";

    // The name of the Shared Preferences file for permission use
    private static final String PERMISSION_PREFS = "PluginPermStates";

    // Reference to the Bridge
    protected Bridge bridge;

    // Reference to the PluginHandle wrapper for this Plugin
    protected PluginHandle handle;

    // A way for plugins to quickly save a call that they will
    // need to reference between activity/permissions starts/requests
    protected PluginCall savedLastCall;

    // Stored event listeners
    private final Map<String, List<PluginCall>> eventListeners;

    // Stored results of an event if an event was fired and
    // no listeners were attached yet. Only stores the last value.
    private final Map<String, JSObject> retainedEventArguments;

    public Plugin() {
        eventListeners = new HashMap<>();
        retainedEventArguments = new HashMap<>();
    }

    /**
     * Called when the plugin has been connected to the bridge
     * and is ready to start initializing.
     */
    public void load() {}

    /**
     * Get the main {@link Context} for the current Activity (your app)
     * @return the Context for the current activity
     */
    public Context getContext() {
        return this.bridge.getContext();
    }

    /**
     * Get the main {@link Activity} for the app
     * @return the Activity for the current app
     */
    public AppCompatActivity getActivity() {
        return (AppCompatActivity) this.bridge.getActivity();
    }

    /**
     * Set the Bridge instance for this plugin
     * @param bridge
     */
    public void setBridge(Bridge bridge) {
        this.bridge = bridge;
    }

    /**
     * Get the Bridge instance for this plugin
     */
    public Bridge getBridge() {
        return this.bridge;
    }

    /**
     * Set the wrapper {@link PluginHandle} instance for this plugin that
     * contains additional metadata about the Plugin instance (such
     * as indexed methods for reflection, and {@link CapacitorPlugin} annotation data).
     * @param pluginHandle
     */
    public void setPluginHandle(PluginHandle pluginHandle) {
        this.handle = pluginHandle;
    }

    /**
     * Return the wrapper {@link PluginHandle} for this plugin.
     *
     * This wrapper contains additional metadata about the plugin instance,
     * such as indexed methods for reflection, and {@link CapacitorPlugin} annotation data).
     * @return
     */
    public PluginHandle getPluginHandle() {
        return this.handle;
    }

    /**
     * Get the root App ID
     * @return
     */
    public String getAppId() {
        return getContext().getPackageName();
    }

    /**
     * Called to save a {@link PluginCall} in order to reference it
     * later, such as in an activity or permissions result handler
     * @param lastCall
     */
    public void saveCall(PluginCall lastCall) {
        this.savedLastCall = lastCall;
    }

    /**
     * Set the last saved call to null to free memory
     */
    public void freeSavedCall() {
        if (!this.savedLastCall.isReleased()) {
            this.savedLastCall.release(bridge);
        }
        this.savedLastCall = null;
    }

    /**
     * Get the last saved call, if any
     * @return
     */
    public PluginCall getSavedCall() {
        return this.savedLastCall;
    }

    public Object getConfigValue(String key) {
        try {
            JSONObject plugins = bridge.getConfig().getObject("plugins");
            if (plugins == null) {
                return null;
            }
            JSONObject pluginConfig = plugins.getJSONObject(getPluginHandle().getId());
            return pluginConfig.get(key);
        } catch (JSONException ex) {
            return null;
        }
    }

    /**
     * Check whether any of the given permissions has been defined in the AndroidManifest.xml
     * @param permissions
     * @return
     */
    public boolean hasDefinedPermissions(String[] permissions) {
        for (String permission : permissions) {
            if (!PermissionHelper.hasDefinedPermission(getContext(), permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check whether any of the given permissions has been defined in the AndroidManifest.xml
     * @param permissions
     * @return
     */
    public boolean hasDefinedPermissions(Permission[] permissions) {
        for (Permission perm : permissions) {
            if (!PermissionHelper.hasDefinedPermission(getContext(), perm.permission())) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check whether any of annotation permissions has been defined in the AndroidManifest.xml
     * @return
     */
    public boolean hasDefinedRequiredPermissions() {
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        if (annotation == null) {
            // Check for legacy plugin annotation, @NativePlugin
            NativePlugin legacyAnnotation = handle.getLegacyPluginAnnotation();
            return hasDefinedPermissions(legacyAnnotation.permissions());
        }

        return hasDefinedPermissions(annotation.permissions());
    }

    /**
     * Check whether the given permission has been granted by the user
     * @param permission
     * @return
     */
    public boolean hasPermission(String permission) {
        return ActivityCompat.checkSelfPermission(this.getContext(), permission) == PackageManager.PERMISSION_GRANTED;
    }

    /**
     * If the {@link CapacitorPlugin} annotation specified a set of permissions,
     * this method checks if each is granted. Note: if you are okay
     * with a limited subset of the permissions being granted, check
     * each one individually instead with hasPermission
     * @return
     */
    public boolean hasRequiredPermissions() {
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        if (annotation == null) {
            // Check for legacy plugin annotation, @NativePlugin
            NativePlugin legacyAnnotation = handle.getLegacyPluginAnnotation();
            for (String perm : legacyAnnotation.permissions()) {
                if (!hasPermission(perm)) {
                    return false;
                }
            }

            return true;
        }

        for (Permission perm : annotation.permissions()) {
            if (!hasPermission(perm.permission())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Exported plugin call for checking the granted status for each permission
     * declared on the plugin. This plugin call responds with a mapping of permissions to
     * the associated granted status.
     *
     * @since 3.0.0
     */
    @PluginMethod
    public void checkPermissions(PluginCall pluginCall) {
        JSObject permissionsResult = getPermissionStates();
        pluginCall.resolve(permissionsResult);
    }

    /**
     * Helper to check all permissions and see the current states of each permission.
     *
     * @since 3.0.0
     * @return A mapping of permissions to the associated granted status.
     */
    public JSObject getPermissionStates() {
        JSObject permissionsResults = new JSObject();
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        for (Permission perm : annotation.permissions()) {
            String key = perm.alias().isEmpty() ? perm.permission() : perm.alias();
            String permissionStatus = hasPermission(perm.permission()) ? "granted" : "prompt";

            // Check if there is a cached permission state for the "Never ask again" state
            if (permissionStatus.equals("prompt")) {
                SharedPreferences prefs = getContext().getSharedPreferences(PERMISSION_PREFS, Activity.MODE_PRIVATE);
                String state = prefs.getString(perm.permission(), null);

                if (state != null) {
                    permissionStatus = state;
                }
            }

            String existingResult = permissionsResults.getString(key);

            // multiple permissions with the same alias must all be true, otherwise all false.
            if (existingResult == null || existingResult.equals("granted")) {
                permissionsResults.put(key, permissionStatus);
            }
        }

        return permissionsResults;
    }

    /**
     * Helper to make requesting permissions easy
     * @param permissions the set of permissions to request
     * @param requestCode the requestCode to use to associate the result with the plugin
     */
    public void pluginRequestPermissions(String[] permissions, int requestCode) {
        ActivityCompat.requestPermissions(getActivity(), permissions, requestCode);
    }

    /**
     * Request all of the specified permissions in the CapacitorPlugin annotation (if any)
     */
    public void pluginRequestAllPermissions() {
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        if (annotation == null) {
            NativePlugin legacyAnnotation = handle.getLegacyPluginAnnotation();
            ActivityCompat.requestPermissions(getActivity(), legacyAnnotation.permissions(), legacyAnnotation.permissionRequestCode());
            return;
        }

        String[] perms = new String[annotation.permissions().length];
        for (int i = 0; i < perms.length; i++) {
            perms[i] = annotation.permissions()[i].permission();
        }

        ActivityCompat.requestPermissions(getActivity(), perms, annotation.permissionRequestCode());
    }

    /**
     * Helper to make requesting individual permissions easy
     * @param permission the permission to request
     * @param requestCode the requestCode to use to associate the result with the plugin
     */
    public void pluginRequestPermission(String permission, int requestCode) {
        ActivityCompat.requestPermissions(getActivity(), new String[] { permission }, requestCode);
    }

    /**
     * Add a listener for the given event
     * @param eventName
     * @param call
     */
    private void addEventListener(String eventName, PluginCall call) {
        List<PluginCall> listeners = eventListeners.get(eventName);
        if (listeners == null || listeners.isEmpty()) {
            listeners = new ArrayList<>();
            eventListeners.put(eventName, listeners);

            // Must add the call before sending retained arguments
            listeners.add(call);

            sendRetainedArgumentsForEvent(eventName);
        } else {
            listeners.add(call);
        }
    }

    /**
     * Remove a listener from the given event
     * @param eventName
     * @param call
     */
    private void removeEventListener(String eventName, PluginCall call) {
        List<PluginCall> listeners = eventListeners.get(eventName);
        if (listeners == null) {
            return;
        }

        listeners.remove(call);
    }

    /**
     * Notify all listeners that an event occurred
     * @param eventName
     * @param data
     */
    protected void notifyListeners(String eventName, JSObject data, boolean retainUntilConsumed) {
        Logger.verbose(getLogTag(), "Notifying listeners for event " + eventName);
        List<PluginCall> listeners = eventListeners.get(eventName);
        if (listeners == null || listeners.isEmpty()) {
            Logger.debug(getLogTag(), "No listeners found for event " + eventName);
            if (retainUntilConsumed) {
                retainedEventArguments.put(eventName, data);
            }
            return;
        }

        for (PluginCall call : listeners) {
            call.resolve(data);
        }
    }

    /**
     * Notify all listeners that an event occurred
     * This calls {@link Plugin#notifyListeners(String, JSObject, boolean)}
     * with retainUntilConsumed set to false
     * @param eventName
     * @param data
     */
    protected void notifyListeners(String eventName, JSObject data) {
        notifyListeners(eventName, data, false);
    }

    /**
     * Check if there are any listeners for the given event
     */
    protected boolean hasListeners(String eventName) {
        List<PluginCall> listeners = eventListeners.get(eventName);
        if (listeners == null) {
            return false;
        }
        return listeners.size() > 0;
    }

    /**
     * Send retained arguments (if any) for this event. This
     * is called only when the first listener for an event is added
     * @param eventName
     */
    private void sendRetainedArgumentsForEvent(String eventName) {
        JSObject retained = retainedEventArguments.get(eventName);
        if (retained == null) {
            return;
        }

        notifyListeners(eventName, retained);
        retainedEventArguments.remove(eventName);
    }

    /**
     * Exported plugin call for adding a listener to this plugin
     * @param call
     */
    @SuppressWarnings("unused")
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void addListener(PluginCall call) {
        String eventName = call.getString("eventName");
        call.save();
        addEventListener(eventName, call);
    }

    /**
     * Exported plugin call to remove a listener from this plugin
     * @param call
     */
    @SuppressWarnings("unused")
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void removeListener(PluginCall call) {
        String eventName = call.getString("eventName");
        String callbackId = call.getString("callbackId");
        PluginCall savedCall = bridge.getSavedCall(callbackId);
        if (savedCall != null) {
            removeEventListener(eventName, savedCall);
            bridge.releaseCall(savedCall);
        }
    }

    /**
     * Exported plugin call to remove all listeners from this plugin
     * @param call
     */
    @SuppressWarnings("unused")
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void removeAllListeners(PluginCall call) {
        eventListeners.clear();
    }

    /**
     * Exported plugin call to request all permissions for this plugin
     * @param call
     */
    @PluginMethod
    public void requestPermissions(PluginCall call) {
        String[] perms = null;
        int permissionRequestCode;

        // If call was made with a list of permissions to request, save them to be requested
        //  instead of all permissions
        JSArray providedPerms = call.getArray("permissions");
        List<String> providedPermsList = null;

        try {
            providedPermsList = providedPerms.toList();
        } catch (JSONException e) {}

        CapacitorPlugin annotation = handle.getPluginAnnotation();
        if (annotation == null) {
            NativePlugin legacyAnnotation = this.handle.getLegacyPluginAnnotation();
            perms = legacyAnnotation.permissions();
            permissionRequestCode = legacyAnnotation.permissionRequestCode();
        } else {
            // If call was made without any custom permissions, request all from plugin annotation
            if (providedPermsList == null || providedPermsList.isEmpty()) {
                perms = new String[annotation.permissions().length];
                for (int i = 0; i < perms.length; i++) {
                    perms[i] = annotation.permissions()[i].permission();
                }
            } else {
                Set<String> permsSet = new HashSet<>();
                for (Permission perm : annotation.permissions()) {
                    if (providedPermsList.contains(perm.alias()) || providedPermsList.contains(perm.permission())) {
                        permsSet.add(perm.permission());
                    }
                }

                if (permsSet.isEmpty()) {
                    call.reject("No valid permission or permission alias was requested.");
                } else {
                    perms = permsSet.toArray(new String[0]);
                }
            }

            permissionRequestCode = annotation.permissionRequestCode();
        }

        if (perms != null && perms.length > 0) {
            // Save the call so we can return data back once the permission request has completed
            saveCall(call);

            pluginRequestPermissions(perms, permissionRequestCode);
        } else {
            call.resolve();
        }
    }

    /**
     * Handle request permissions result. A plugin using the deprecated {@link NativePlugin}
     * should override this to handle the result, or this method will handle the result
     * for our convenient requestPermissions call.
     * @deprecated in favor of using {@link #onRequestPermissionsResult} in conjunction with {@link CapacitorPlugin}
     *
     * @param requestCode
     * @param permissions
     * @param grantResults
     */
    @Deprecated
    protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (!hasDefinedPermissions(permissions)) {
            StringBuilder builder = new StringBuilder();
            builder.append("Missing the following permissions in AndroidManifest.xml:\n");
            String[] missing = PermissionHelper.getUndefinedPermissions(getContext(), permissions);
            for (String perm : missing) {
                builder.append(perm + "\n");
            }
            savedLastCall.reject(builder.toString());
            savedLastCall = null;
        }
    }

    /**
     * Handle request permissions result. A plugin using the {@link CapacitorPlugin} annotation
     * can override this to handle the result, or this method will handle the result for
     * our convenient requestPermissions call.
     *
     * @param requestCode
     * @param permissions
     * @param grantResults
     */
    protected void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        PluginCall savedCall = getSavedCall();
        if (savedCall == null) {
            return;
        }

        if (validatePermissions(permissions, grantResults)) {
            savedCall.resolve(getPermissionStates());
        }

        freeSavedCall();
    }

    /**
     * Saves permission states and rejects if permissions were not correctly defined in
     * the AndroidManifest.xml file.
     *
     * Plugins overriding {@link #onRequestPermissionsResult(int, String[], int[])} should call
     * this method to save permission states correctly.
     *
     * @param permissions
     * @param grantResults
     * @return true if permissions were saved and defined correctly, false if not
     */
    public boolean validatePermissions(String[] permissions, int[] grantResults) {
        SharedPreferences prefs = getContext().getSharedPreferences(PERMISSION_PREFS, Activity.MODE_PRIVATE);

        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            // Permission granted. If previously denied, remove cached state
            for (String permission : permissions) {
                String state = prefs.getString(permission, null);

                if (state != null) {
                    SharedPreferences.Editor editor = prefs.edit();
                    editor.remove(permission);
                    editor.apply();
                }
            }
        } else {
            for (String permission : permissions) {
                SharedPreferences.Editor editor = prefs.edit();

                if (ActivityCompat.shouldShowRequestPermissionRationale(getActivity(), permission)) {
                    // Permission denied, can prompt again with rationale
                    editor.putString(permission, "prompt-with-rationale");
                } else {
                    // Permission denied permanently, store this state for future reference
                    editor.putString(permission, "denied");
                }

                editor.apply();
            }
        }

        if (!hasDefinedPermissions(permissions)) {
            StringBuilder builder = new StringBuilder();
            builder.append("Missing the following permissions in AndroidManifest.xml:\n");
            String[] missing = PermissionHelper.getUndefinedPermissions(getContext(), permissions);
            for (String perm : missing) {
                builder.append(perm + "\n");
            }
            savedLastCall.reject(builder.toString());
            return false;
        }

        return true;
    }

    /**
     * Called before the app is destroyed to give a plugin the chance to
     * save the last call options for a saved plugin. By default, this
     * method saves the full JSON blob of the options call. Since Bundle sizes
     * may be limited, plugins that expect to be called with large data
     * objects (such as a file), should override this method and selectively
     * store option values in a {@link Bundle} to avoid exceeding limits.
     * @return a new {@link Bundle} with fields set from the options of the last saved {@link PluginCall}
     */
    protected Bundle saveInstanceState() {
        PluginCall savedCall = getSavedCall();

        if (savedCall == null) {
            return null;
        }

        Bundle ret = new Bundle();
        JSObject callData = savedCall.getData();

        if (callData != null) {
            ret.putString(BUNDLE_PERSISTED_OPTIONS_JSON_KEY, callData.toString());
        }

        return ret;
    }

    /**
     * Called when the app is opened with a previously un-handled
     * activity response. If the plugin that started the activity
     * stored data in {@link Plugin#saveInstanceState()} then this
     * method will be called to allow the plugin to restore from that.
     * @param state
     */
    protected void restoreState(Bundle state) {}

    /**
     * Handle activity result, should be overridden by each plugin
     * @param requestCode
     * @param resultCode
     * @param data
     */
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {}

    /**
     * Handle onNewIntent
     * @param intent
     */
    protected void handleOnNewIntent(Intent intent) {}

    /**
     * Handle onStart
     */
    protected void handleOnStart() {}

    /**
     * Handle onRestart
     */
    protected void handleOnRestart() {}

    /**
     * Handle onResume
     */
    protected void handleOnResume() {}

    /**
     * Handle onPause
     */
    protected void handleOnPause() {}

    /**
     * Handle onStop
     */
    protected void handleOnStop() {}

    /**
     * Handle onDestroy
     */
    protected void handleOnDestroy() {}

    /**
     * Give the plugins a chance to take control when a URL is about to be loaded in the WebView.
     * Returning true causes the WebView to abort loading the URL.
     * Returning false causes the WebView to continue loading the URL.
     * Returning null will defer to the default Capacitor policy
     */
    @SuppressWarnings("unused")
    public Boolean shouldOverrideLoad(Uri url) {
        return null;
    }

    /**
     * Start a new Activity.
     *
     * Note: This method must be used by all plugins instead of calling
     * {@link Activity#startActivityForResult} as it associates the plugin with
     * any resulting data from the new Activity even if this app
     * is destroyed by the OS (to free up memory, for example).
     * @param intent
     * @param resultCode
     */
    protected void startActivityForResult(PluginCall call, Intent intent, int resultCode) {
        bridge.startActivityForPluginWithResult(call, intent, resultCode);
    }

    /**
     * Execute the given runnable on the Bridge's task handler
     * @param runnable
     */
    public void execute(Runnable runnable) {
        bridge.execute(runnable);
    }

    /**
     * Shortcut for getting the plugin log tag
     * @param subTags
     */
    protected String getLogTag(String... subTags) {
        return Logger.tags(subTags);
    }

    /**
     * Gets a plugin log tag with the child's class name as subTag.
     */
    protected String getLogTag() {
        return Logger.tags(this.getClass().getSimpleName());
    }
}
