package com.getcapacitor;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Bundle;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.util.PermissionHelper;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import org.json.JSONException;

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

    // Reference to the Bridge
    protected Bridge bridge;

    // Reference to the PluginHandle wrapper for this Plugin
    protected PluginHandle handle;

    /**
     * A way for plugins to quickly save a call that they will need to reference
     * between activity/permissions starts/requests
     *
     * @deprecated store calls on the bridge using the methods
     * {@link com.getcapacitor.Bridge#saveCall(PluginCall)},
     * {@link com.getcapacitor.Bridge#getSavedCall(String)} and
     * {@link com.getcapacitor.Bridge#releaseCall(PluginCall)}
     */
    @Deprecated
    protected PluginCall savedLastCall;

    // Stored event listeners
    private final Map<String, List<PluginCall>> eventListeners;

    /**
     * Launchers used by the plugin to handle activity results
     */
    private final Map<String, ActivityResultLauncher<Intent>> activityLaunchers = new HashMap<>();

    /**
     * Launchers used by the plugin to handle permission results
     */
    private final Map<String, ActivityResultLauncher<String[]>> permissionLaunchers = new HashMap<>();

    private String lastPluginCallId;

    // Stored results of an event if an event was fired and
    // no listeners were attached yet. Only stores the last value.
    private final Map<String, List<JSObject>> retainedEventArguments;

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
     * Registers activity result launchers defined on plugins, used for permission requests and
     * activities started for result.
     */
    void initializeActivityLaunchers() {
        List<Method> pluginClassMethods = new ArrayList<>();
        for (
            Class<?> pluginCursor = getClass();
            !pluginCursor.getName().equals(Object.class.getName());
            pluginCursor = pluginCursor.getSuperclass()
        ) {
            pluginClassMethods.addAll(Arrays.asList(pluginCursor.getDeclaredMethods()));
        }

        for (final Method method : pluginClassMethods) {
            if (method.isAnnotationPresent(ActivityCallback.class)) {
                // register callbacks annotated with ActivityCallback for activity results
                ActivityResultLauncher<Intent> launcher = bridge.registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    (result) -> triggerActivityCallback(method, result)
                );

                activityLaunchers.put(method.getName(), launcher);
            } else if (method.isAnnotationPresent(PermissionCallback.class)) {
                // register callbacks annotated with PermissionCallback for permission results
                ActivityResultLauncher<String[]> launcher = bridge.registerForActivityResult(
                    new ActivityResultContracts.RequestMultiplePermissions(),
                    (permissions) -> triggerPermissionCallback(method, permissions)
                );

                permissionLaunchers.put(method.getName(), launcher);
            }
        }
    }

    private void triggerPermissionCallback(Method method, Map<String, Boolean> permissionResultMap) {
        PluginCall savedCall = bridge.getPermissionCall(handle.getId());

        // validate permissions and invoke the permission result callback
        if (bridge.validatePermissions(this, savedCall, permissionResultMap)) {
            try {
                method.setAccessible(true);
                method.invoke(this, savedCall);
            } catch (IllegalAccessException | InvocationTargetException e) {
                e.printStackTrace();
            }
        }
    }

    private void triggerActivityCallback(Method method, ActivityResult result) {
        PluginCall savedCall = bridge.getSavedCall(lastPluginCallId);
        if (savedCall == null) {
            savedCall = bridge.getPluginCallForLastActivity();
        }
        // invoke the activity result callback
        try {
            method.setAccessible(true);
            method.invoke(this, savedCall, result);
        } catch (IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
    }

    /**
     * Start activity for result with the provided Intent and resolve with the provided callback method name.
     * <p>
     * If there is no registered activity callback for the method name passed in, the call will
     * be rejected. Make sure a valid activity result callback method is registered using the
     * {@link ActivityCallback} annotation.
     *
     * @param call the plugin call
     * @param intent the intent used to start an activity
     * @param callbackName the name of the callback to run when the launched activity is finished
     * @since 3.0.0
     */
    public void startActivityForResult(PluginCall call, Intent intent, String callbackName) {
        ActivityResultLauncher<Intent> activityResultLauncher = getActivityLauncherOrReject(call, callbackName);
        if (activityResultLauncher == null) {
            // return when null since call was rejected in getLauncherOrReject
            return;
        }
        bridge.setPluginCallForLastActivity(call);
        lastPluginCallId = call.getCallbackId();
        bridge.saveCall(call);
        activityResultLauncher.launch(intent);
    }

    private void permissionActivityResult(PluginCall call, String[] permissionStrings, String callbackName) {
        ActivityResultLauncher<String[]> permissionResultLauncher = getPermissionLauncherOrReject(call, callbackName);
        if (permissionResultLauncher == null) {
            // return when null since call was rejected in getLauncherOrReject
            return;
        }

        bridge.savePermissionCall(call);
        permissionResultLauncher.launch(permissionStrings);
    }

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
        return this.bridge.getActivity();
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
     * @deprecated use {@link Bridge#saveCall(PluginCall)}
     *
     * @param lastCall
     */
    @Deprecated
    public void saveCall(PluginCall lastCall) {
        this.savedLastCall = lastCall;
    }

    /**
     * Set the last saved call to null to free memory
     * @deprecated use {@link PluginCall#release(Bridge)}
     */
    @Deprecated
    public void freeSavedCall() {
        this.savedLastCall.release(bridge);
        this.savedLastCall = null;
    }

    /**
     * Get the last saved call, if any
     * @deprecated use {@link Bridge#getSavedCall(String)}
     *
     * @return
     */
    @Deprecated
    public PluginCall getSavedCall() {
        return this.savedLastCall;
    }

    /**
     * Get the config options for this plugin.
     *
     * @return a config object representing the plugin config options, or an empty config
     * if none exists
     */
    public PluginConfig getConfig() {
        return bridge.getConfig().getPluginConfiguration(handle.getId());
    }

    /**
     * Get the value for a key on the config for this plugin.
     * @deprecated use {@link #getConfig()} and access config values using the methods available
     * depending on the type.
     *
     * @param key the key for the config value
     * @return some object containing the value from the config
     */
    @Deprecated
    public Object getConfigValue(String key) {
        try {
            PluginConfig pluginConfig = getConfig();
            return pluginConfig.getConfigJSON().get(key);
        } catch (JSONException ex) {
            return null;
        }
    }

    /**
     * Check whether any of the given permissions has been defined in the AndroidManifest.xml
     * @deprecated use {@link #isPermissionDeclared(String)}
     *
     * @param permissions
     * @return
     */
    @Deprecated
    public boolean hasDefinedPermissions(String[] permissions) {
        for (String permission : permissions) {
            if (!PermissionHelper.hasDefinedPermission(getContext(), permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if all annotated permissions have been defined in the AndroidManifest.xml
     * @deprecated use {@link #isPermissionDeclared(String)}
     *
     * @return true if permissions are all defined in the Manifest
     */
    @Deprecated
    public boolean hasDefinedRequiredPermissions() {
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        if (annotation == null) {
            // Check for legacy plugin annotation, @NativePlugin
            NativePlugin legacyAnnotation = handle.getLegacyPluginAnnotation();
            return hasDefinedPermissions(legacyAnnotation.permissions());
        } else {
            for (Permission perm : annotation.permissions()) {
                for (String permString : perm.strings()) {
                    if (!PermissionHelper.hasDefinedPermission(getContext(), permString)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Checks if the given permission alias is correctly declared in AndroidManifest.xml
     * @param alias a permission alias defined on the plugin
     * @return true only if all permissions associated with the given alias are declared in the manifest
     */
    public boolean isPermissionDeclared(String alias) {
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        if (annotation != null) {
            for (Permission perm : annotation.permissions()) {
                if (alias.equalsIgnoreCase(perm.alias())) {
                    boolean result = true;
                    for (String permString : perm.strings()) {
                        result = result && PermissionHelper.hasDefinedPermission(getContext(), permString);
                    }

                    return result;
                }
            }
        }

        Logger.error(String.format("isPermissionDeclared: No alias defined for %s " + "or missing @CapacitorPlugin annotation.", alias));
        return false;
    }

    /**
     * Check whether the given permission has been granted by the user
     * @deprecated use {@link #getPermissionState(String)} and {@link #getPermissionStates()} to get
     * the states of permissions defined on the Plugin in conjunction with the @CapacitorPlugin
     * annotation. Use the Android API {@link ActivityCompat#checkSelfPermission(Context, String)}
     * methods to check permissions with Android permission strings
     *
     * @param permission
     * @return
     */
    @Deprecated
    public boolean hasPermission(String permission) {
        return ActivityCompat.checkSelfPermission(this.getContext(), permission) == PackageManager.PERMISSION_GRANTED;
    }

    /**
     * If the plugin annotation specified a set of permissions, this method checks if each is
     * granted
     * @deprecated use {@link #getPermissionState(String)} or {@link #getPermissionStates()} to
     * check whether permissions are granted or not
     *
     * @return
     */
    @Deprecated
    public boolean hasRequiredPermissions() {
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        if (annotation == null) {
            // Check for legacy plugin annotation, @NativePlugin
            NativePlugin legacyAnnotation = handle.getLegacyPluginAnnotation();
            for (String perm : legacyAnnotation.permissions()) {
                if (ActivityCompat.checkSelfPermission(this.getContext(), perm) != PackageManager.PERMISSION_GRANTED) {
                    return false;
                }
            }

            return true;
        }

        for (Permission perm : annotation.permissions()) {
            for (String permString : perm.strings()) {
                if (ActivityCompat.checkSelfPermission(this.getContext(), permString) != PackageManager.PERMISSION_GRANTED) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Request all of the specified permissions in the CapacitorPlugin annotation (if any)
     *
     * If there is no registered permission callback for the PluginCall passed in, the call will
     * be rejected. Make sure a valid permission callback method is registered using the
     * {@link PermissionCallback} annotation.
     *
     * @since 3.0.0
     * @param call the plugin call
     * @param callbackName the name of the callback to run when the permission request is complete
     */
    protected void requestAllPermissions(@NonNull PluginCall call, @NonNull String callbackName) {
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        if (annotation != null) {
            HashSet<String> perms = new HashSet<>();
            for (Permission perm : annotation.permissions()) {
                perms.addAll(Arrays.asList(perm.strings()));
            }

            permissionActivityResult(call, perms.toArray(new String[0]), callbackName);
        }
    }

    /**
     * Request permissions using an alias defined on the plugin.
     *
     * If there is no registered permission callback for the PluginCall passed in, the call will
     * be rejected. Make sure a valid permission callback method is registered using the
     * {@link PermissionCallback} annotation.
     *
     * @param alias an alias defined on the plugin
     * @param call  the plugin call involved in originating the request
     * @param callbackName the name of the callback to run when the permission request is complete
     */
    protected void requestPermissionForAlias(@NonNull String alias, @NonNull PluginCall call, @NonNull String callbackName) {
        requestPermissionForAliases(new String[] { alias }, call, callbackName);
    }

    /**
     * Request permissions using aliases defined on the plugin.
     *
     * If there is no registered permission callback for the PluginCall passed in, the call will
     * be rejected. Make sure a valid permission callback method is registered using the
     * {@link PermissionCallback} annotation.
     *
     * @param aliases a set of aliases defined on the plugin
     * @param call    the plugin call involved in originating the request
     * @param callbackName the name of the callback to run when the permission request is complete
     */
    protected void requestPermissionForAliases(@NonNull String[] aliases, @NonNull PluginCall call, @NonNull String callbackName) {
        if (aliases.length == 0) {
            Logger.error("No permission alias was provided");
            return;
        }

        String[] permissions = getPermissionStringsForAliases(aliases);

        if (permissions.length > 0) {
            permissionActivityResult(call, permissions, callbackName);
        }
    }

    /**
     * Gets the Android permission strings defined on the {@link CapacitorPlugin} annotation with
     * the provided aliases.
     *
     * @param aliases aliases for permissions defined on the plugin
     * @return Android permission strings associated with the provided aliases, if exists
     */
    private String[] getPermissionStringsForAliases(@NonNull String[] aliases) {
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        HashSet<String> perms = new HashSet<>();
        for (Permission perm : annotation.permissions()) {
            if (Arrays.asList(aliases).contains(perm.alias())) {
                perms.addAll(Arrays.asList(perm.strings()));
            }
        }

        return perms.toArray(new String[0]);
    }

    /**
     * Gets the activity launcher associated with the calling methodName, or rejects the call if
     * no registered launcher exists
     *
     * @param call       the plugin call
     * @param methodName the name of the activity callback method
     * @return a launcher, or null if none found
     */
    private @Nullable ActivityResultLauncher<Intent> getActivityLauncherOrReject(PluginCall call, String methodName) {
        ActivityResultLauncher<Intent> activityLauncher = activityLaunchers.get(methodName);

        // if there is no registered launcher, reject the call with an error and return null
        if (activityLauncher == null) {
            String registerError =
                "There is no ActivityCallback method registered for the name: %s. " +
                "Please define a callback method annotated with @ActivityCallback " +
                "that receives arguments: (PluginCall, ActivityResult)";
            registerError = String.format(Locale.US, registerError, methodName);
            Logger.error(registerError);
            call.reject(registerError);
            return null;
        }

        return activityLauncher;
    }

    /**
     * Gets the permission launcher associated with the calling methodName, or rejects the call if
     * no registered launcher exists
     *
     * @param call       the plugin call
     * @param methodName the name of the permission callback method
     * @return a launcher, or null if none found
     */
    private @Nullable ActivityResultLauncher<String[]> getPermissionLauncherOrReject(PluginCall call, String methodName) {
        ActivityResultLauncher<String[]> permissionLauncher = permissionLaunchers.get(methodName);

        // if there is no registered launcher, reject the call with an error and return null
        if (permissionLauncher == null) {
            String registerError =
                "There is no PermissionCallback method registered for the name: %s. " +
                "Please define a callback method annotated with @PermissionCallback " +
                "that receives arguments: (PluginCall)";
            registerError = String.format(Locale.US, registerError, methodName);
            Logger.error(registerError);
            call.reject(registerError);
            return null;
        }

        return permissionLauncher;
    }

    /**
     * Request all of the specified permissions in the CapacitorPlugin annotation (if any)
     *
     * @deprecated use {@link #requestAllPermissions(PluginCall, String)} in conjunction with @CapacitorPlugin
     */
    @Deprecated
    public void pluginRequestAllPermissions() {
        NativePlugin legacyAnnotation = handle.getLegacyPluginAnnotation();
        ActivityCompat.requestPermissions(getActivity(), legacyAnnotation.permissions(), legacyAnnotation.permissionRequestCode());
    }

    /**
     * Helper for requesting a specific permission
     *
     * @param permission  the permission to request
     * @param requestCode the requestCode to use to associate the result with the plugin
     * @deprecated use {@link #requestPermissionForAlias(String, PluginCall, String)} in conjunction with @CapacitorPlugin
     */
    @Deprecated
    public void pluginRequestPermission(String permission, int requestCode) {
        ActivityCompat.requestPermissions(getActivity(), new String[] { permission }, requestCode);
    }

    /**
     * Helper for requesting specific permissions
     * @deprecated use {@link #requestPermissionForAliases(String[], PluginCall, String)} in conjunction
     * with @CapacitorPlugin
     *
     * @param permissions the set of permissions to request
     * @param requestCode the requestCode to use to associate the result with the plugin
     */
    @Deprecated
    public void pluginRequestPermissions(String[] permissions, int requestCode) {
        ActivityCompat.requestPermissions(getActivity(), permissions, requestCode);
    }

    /**
     * Get the permission state for the provided permission alias.
     *
     * @param alias the permission alias to get
     * @return the state of the provided permission alias or null
     */
    public PermissionState getPermissionState(String alias) {
        return getPermissionStates().get(alias);
    }

    /**
     * Helper to check all permissions defined on a plugin and see the state of each.
     *
     * @since 3.0.0
     * @return A mapping of permission aliases to the associated granted status.
     */
    public Map<String, PermissionState> getPermissionStates() {
        return bridge.getPermissionStates(this);
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
                List<JSObject> argList = retainedEventArguments.get(eventName);

                if (argList == null) {
                    argList = new ArrayList<JSObject>();
                }

                argList.add(data);
                retainedEventArguments.put(eventName, argList);
            }
            return;
        }

        CopyOnWriteArrayList<PluginCall> listenersCopy = new CopyOnWriteArrayList(listeners);
        for (PluginCall call : listenersCopy) {
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
        return !listeners.isEmpty();
    }

    /**
     * Send retained arguments (if any) for this event. This
     * is called only when the first listener for an event is added
     * @param eventName
     */
    private void sendRetainedArgumentsForEvent(String eventName) {
        // copy retained args and null source to prevent potential race conditions
        List<JSObject> retainedArgs = retainedEventArguments.get(eventName);
        if (retainedArgs == null) {
            return;
        }

        retainedEventArguments.remove(eventName);

        for (JSObject retained : retainedArgs) {
            notifyListeners(eventName, retained);
        }
    }

    /**
     * Exported plugin call for adding a listener to this plugin
     * @param call
     */
    @SuppressWarnings("unused")
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void addListener(PluginCall call) {
        String eventName = call.getString("eventName");
        call.setKeepAlive(true);
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
    @PluginMethod(returnType = PluginMethod.RETURN_PROMISE)
    public void removeAllListeners(PluginCall call) {
        eventListeners.clear();
        call.resolve();
    }

    public void removeAllListeners() {
        eventListeners.clear();
    }

    /**
     * Exported plugin call for checking the granted status for each permission
     * declared on the plugin. This plugin call responds with a mapping of permissions to
     * the associated granted status.
     *
     * @since 3.0.0
     */
    @PluginMethod
    @PermissionCallback
    public void checkPermissions(PluginCall pluginCall) {
        Map<String, PermissionState> permissionsResult = getPermissionStates();

        if (permissionsResult.size() == 0) {
            // if no permissions are defined on the plugin, resolve undefined
            pluginCall.resolve();
        } else {
            JSObject permissionsResultJSON = new JSObject();
            for (Map.Entry<String, PermissionState> entry : permissionsResult.entrySet()) {
                permissionsResultJSON.put(entry.getKey(), entry.getValue());
            }

            pluginCall.resolve(permissionsResultJSON);
        }
    }

    /**
     * Exported plugin call to request all permissions for this plugin.
     * To manually request permissions within a plugin use:
     * {@link #requestAllPermissions(PluginCall, String)}, or
     * {@link #requestPermissionForAlias(String, PluginCall, String)}, or
     * {@link #requestPermissionForAliases(String[], PluginCall, String)}
     *
     * @param call the plugin call
     */
    @PluginMethod
    public void requestPermissions(PluginCall call) {
        CapacitorPlugin annotation = handle.getPluginAnnotation();
        if (annotation == null) {
            handleLegacyPermission(call);
        } else {
            // handle permission requests for plugins defined with @CapacitorPlugin (since 3.0.0)
            String[] permAliases = null;
            Set<String> autoGrantPerms = new HashSet<>();

            // If call was made with a list of specific permission aliases to request, save them
            // to be requested
            JSArray providedPerms = call.getArray("permissions");
            List<String> providedPermsList = null;

            if (providedPerms != null) {
                try {
                    providedPermsList = providedPerms.toList();
                } catch (JSONException ignore) {
                    // do nothing
                }
            }

            // If call was made without any custom permissions, request all from plugin annotation
            Set<String> aliasSet = new HashSet<>();
            if (providedPermsList == null || providedPermsList.isEmpty()) {
                for (Permission perm : annotation.permissions()) {
                    // If a permission is defined with no permission strings, separate it for auto-granting.
                    // Otherwise, the alias is added to the list to be requested.
                    if (perm.strings().length == 0 || (perm.strings().length == 1 && perm.strings()[0].isEmpty())) {
                        if (!perm.alias().isEmpty()) {
                            autoGrantPerms.add(perm.alias());
                        }
                    } else {
                        aliasSet.add(perm.alias());
                    }
                }

                permAliases = aliasSet.toArray(new String[0]);
            } else {
                for (Permission perm : annotation.permissions()) {
                    if (providedPermsList.contains(perm.alias())) {
                        aliasSet.add(perm.alias());
                    }
                }

                if (aliasSet.isEmpty()) {
                    call.reject("No valid permission alias was requested of this plugin.");
                } else {
                    permAliases = aliasSet.toArray(new String[0]);
                }
            }

            if (permAliases != null && permAliases.length > 0) {
                // request permissions using provided aliases or all defined on the plugin
                requestPermissionForAliases(permAliases, call, "checkPermissions");
            } else if (!autoGrantPerms.isEmpty()) {
                // if the plugin only has auto-grant permissions, return all as GRANTED
                JSObject permissionsResults = new JSObject();

                for (String perm : autoGrantPerms) {
                    permissionsResults.put(perm, PermissionState.GRANTED.toString());
                }

                call.resolve(permissionsResults);
            } else {
                // no permissions are defined on the plugin, resolve undefined
                call.resolve();
            }
        }
    }

    @SuppressWarnings("deprecation")
    private void handleLegacyPermission(PluginCall call) {
        // handle permission requests for plugins defined with @NativePlugin (prior to 3.0.0)
        NativePlugin legacyAnnotation = this.handle.getLegacyPluginAnnotation();
        String[] perms = legacyAnnotation.permissions();
        if (perms.length > 0) {
            saveCall(call);
            pluginRequestPermissions(perms, legacyAnnotation.permissionRequestCode());
        } else {
            call.resolve();
        }
    }

    /**
     * Handle request permissions result. A plugin using the deprecated {@link NativePlugin}
     * should override this to handle the result, or this method will handle the result
     * for our convenient requestPermissions call.
     * @deprecated in favor of using callbacks in conjunction with {@link CapacitorPlugin}
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
     * Called before the app is destroyed to give a plugin the chance to
     * save the last call options for a saved plugin. By default, this
     * method saves the full JSON blob of the options call. Since Bundle sizes
     * may be limited, plugins that expect to be called with large data
     * objects (such as a file), should override this method and selectively
     * store option values in a {@link Bundle} to avoid exceeding limits.
     * @return a new {@link Bundle} with fields set from the options of the last saved {@link PluginCall}
     */
    protected Bundle saveInstanceState() {
        PluginCall savedCall = bridge.getSavedCall(lastPluginCallId);

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
     *
     * @deprecated provide a callback method using the {@link ActivityCallback} annotation and use
     * the {@link #startActivityForResult(PluginCall, Intent, String)} method
     *
     * @param requestCode
     * @param resultCode
     * @param data
     */
    @Deprecated
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {}

    /**
     * Handle onNewIntent
     * @param intent
     */
    protected void handleOnNewIntent(Intent intent) {}

    /**
     * Handle onConfigurationChanged
     * @param newConfig
     */
    protected void handleOnConfigurationChanged(Configuration newConfig) {}

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
    @Deprecated
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
