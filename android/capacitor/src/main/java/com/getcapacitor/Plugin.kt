package com.getcapacitor

import android.content.Context
import android.content.Intent
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.PermissionCallback
import androidx.appcompat.app.AppCompatActivity
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.core.app.ActivityCompat
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.net.Uri
import android.os.Bundle
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import com.getcapacitor.util.PermissionHelper
import org.json.JSONException
import java.lang.StringBuilder
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method
import java.util.*
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Plugin is the base class for all plugins, containing a number of
 * convenient features for interacting with the [Bridge], managing
 * plugin permissions, tracking lifecycle events, and more.
 *
 * You should inherit from this class when creating new plugins, along with
 * adding the [CapacitorPlugin] annotation to add additional required
 * metadata about the Plugin
 */
open class Plugin {
    /**
     * Get the Bridge instance for this plugin
     */
    /**
     * Set the Bridge instance for this plugin
     * @param bridge
     */
    // Reference to the Bridge
    @JvmField
    var bridge: Bridge? = null

    /**
     * Get the Bridge instance for this plugin
     */
    open fun getBridge(): Bridge? {
        return bridge
    }

    /**
     * Return the wrapper [PluginHandle] for this plugin.
     *
     * This wrapper contains additional metadata about the plugin instance,
     * such as indexed methods for reflection, and [CapacitorPlugin] annotation data).
     * @return
     */
    /**
     * Set the wrapper [PluginHandle] instance for this plugin that
     * contains additional metadata about the Plugin instance (such
     * as indexed methods for reflection, and [CapacitorPlugin] annotation data).
     * @param pluginHandle
     */
    // Reference to the PluginHandle wrapper for this Plugin
    var pluginHandle: PluginHandle? = null
    /**
     * Get the last saved call, if any
     * @return
     */
    /**
     * A way for plugins to quickly save a call that they will need to reference
     * between activity/permissions starts/requests
     *
     */
    @get:Deprecated("""use {@link Bridge#getSavedCall(String)}
     
      """)
    @Deprecated("""store calls on the bridge using the methods
      {@link com.getcapacitor.Bridge#saveCall(PluginCall)},
      {@link com.getcapacitor.Bridge#getSavedCall(String)} and
      {@link com.getcapacitor.Bridge#releaseCall(PluginCall)}""")
    var savedCall: PluginCall? = null
        protected set

    // Stored event listeners
    private val eventListeners: MutableMap<String?, MutableList<PluginCall?>>

    /**
     * Launchers used by the plugin to handle activity results
     */
    private val activityLaunchers: MutableMap<String, ActivityResultLauncher<Intent>> = HashMap()

    /**
     * Launchers used by the plugin to handle permission results
     */
    private val permissionLaunchers: MutableMap<String, ActivityResultLauncher<Array<String>>> = HashMap()
    private var lastPluginCallId: String? = null

    // Stored results of an event if an event was fired and
    // no listeners were attached yet. Only stores the last value.
    private val retainedEventArguments: MutableMap<String?, JSObject?>

    /**
     * Called when the plugin has been connected to the bridge
     * and is ready to start initializing.
     */
    open fun load() {}

    /**
     * Registers activity result launchers defined on plugins, used for permission requests and
     * activities started for result.
     */
    fun initializeActivityLaunchers() {
        val pluginClassMethods: MutableList<Method> = ArrayList()
        var pluginCursor: Class<*> = javaClass
        while (pluginCursor.name != Any::class.java.name) {
            pluginClassMethods.addAll(Arrays.asList(*pluginCursor.declaredMethods))
            pluginCursor = pluginCursor.superclass
        }
        for (method in pluginClassMethods) {
            if (method.isAnnotationPresent(ActivityCallback::class.java)) {
                // register callbacks annotated with ActivityCallback for activity results
                val launcher = bridge!!.registerForActivityResult(
                        ActivityResultContracts.StartActivityForResult()
                ) { result: ActivityResult -> triggerActivityCallback(method, result) }
                activityLaunchers[method.name] = launcher
            } else if (method.isAnnotationPresent(PermissionCallback::class.java)) {
                // register callbacks annotated with PermissionCallback for permission results
                val launcher = bridge!!.registerForActivityResult(
                        ActivityResultContracts.RequestMultiplePermissions()
                ) { permissions: Map<String, Boolean> -> triggerPermissionCallback(method, permissions) }
                permissionLaunchers[method.name] = launcher
            }
        }
    }

    private fun triggerPermissionCallback(method: Method, permissionResultMap: Map<String, Boolean>) {
        val savedCall = bridge!!.getPermissionCall(pluginHandle!!.id)

        // validate permissions and invoke the permission result callback
        if (bridge!!.validatePermissions(this, savedCall!!, permissionResultMap)) {
            try {
                method.isAccessible = true
                method.invoke(this, savedCall)
            } catch (e: IllegalAccessException) {
                e.printStackTrace()
            } catch (e: InvocationTargetException) {
                e.printStackTrace()
            }
        }
    }

    private fun triggerActivityCallback(method: Method, result: ActivityResult) {
        var savedCall = bridge!!.getSavedCall(lastPluginCallId)
        if (savedCall == null) {
            savedCall = bridge!!.getPluginCallForLastActivity()
        }
        // invoke the activity result callback
        try {
            method.isAccessible = true
            method.invoke(this, savedCall, result)
        } catch (e: IllegalAccessException) {
            e.printStackTrace()
        } catch (e: InvocationTargetException) {
            e.printStackTrace()
        }
    }

    /**
     * Start activity for result with the provided Intent and resolve with the provided callback method name.
     *
     *
     * If there is no registered activity callback for the method name passed in, the call will
     * be rejected. Make sure a valid activity result callback method is registered using the
     * [ActivityCallback] annotation.
     *
     * @param call the plugin call
     * @param intent the intent used to start an activity
     * @param callbackName the name of the callback to run when the launched activity is finished
     * @since 3.0.0
     */
    fun startActivityForResult(call: PluginCall, intent: Intent, callbackName: String) {
        val activityResultLauncher = getActivityLauncherOrReject(call, callbackName)
                ?: // return when null since call was rejected in getLauncherOrReject
                return
        bridge!!.setPluginCallForLastActivity(call)
        lastPluginCallId = call.callbackId
        bridge!!.saveCall(call)
        activityResultLauncher.launch(intent)
    }

    private fun permissionActivityResult(call: PluginCall, permissionStrings: Array<String>, callbackName: String) {
        val permissionResultLauncher = getPermissionLauncherOrReject(call, callbackName)
                ?: // return when null since call was rejected in getLauncherOrReject
                return
        bridge!!.savePermissionCall(call)
        permissionResultLauncher.launch(permissionStrings)
    }

    /**
     * Get the main [Context] for the current Activity (your app)
     * @return the Context for the current activity
     */
    val context: Context?
        get() = bridge!!.getContext()

    /**
     * Get the main [Activity] for the app
     * @return the Activity for the current app
     */
    val activity: AppCompatActivity?
        get() = bridge!!.activity

    /**
     * Get the root App ID
     * @return
     */
    val appId: String
        get() = context!!.packageName

    /**
     * Called to save a [PluginCall] in order to reference it
     * later, such as in an activity or permissions result handler
     * @param lastCall
     */
    @Deprecated("""use {@link Bridge#saveCall(PluginCall)}
     
      """)
    fun saveCall(lastCall: PluginCall?) {
        savedCall = lastCall
    }

    /**
     * Set the last saved call to null to free memory
     */
    @Deprecated("use {@link PluginCall#release(Bridge)}")
    fun freeSavedCall() {
        savedCall!!.release(bridge)
        savedCall = null
    }

    /**
     * Get the config options for this plugin.
     *
     * @return a config object representing the plugin config options, or an empty config
     * if none exists
     */
    val config: PluginConfig
        get() = bridge!!.config.getPluginConfiguration(pluginHandle!!.id)

    /**
     * Get the value for a key on the config for this plugin.
     * @param key the key for the config value
     * @return some object containing the value from the config
     */
    @Deprecated("""use {@link #getConfig()} and access config values using the methods available
      depending on the type.
     
      """)
    fun getConfigValue(key: String?): Any? {
        return try {
            val pluginConfig = config
            pluginConfig.configJSON[key]
        } catch (ex: JSONException) {
            null
        }
    }

    /**
     * Check whether any of the given permissions has been defined in the AndroidManifest.xml
     * @param permissions
     * @return
     */
    @Deprecated("""use {@link #isPermissionDeclared(String)}
     
      """)
    fun hasDefinedPermissions(permissions: Array<String>): Boolean {
        for (permission in permissions) {
            if (!PermissionHelper.hasDefinedPermission(context, permission)) {
                return false
            }
        }
        return true
    }

    /**
     * Check if all annotated permissions have been defined in the AndroidManifest.xml
     * @return true if permissions are all defined in the Manifest
     */
    @Deprecated("""use {@link #isPermissionDeclared(String)}
     
      """)
    fun hasDefinedRequiredPermissions(): Boolean {
        val annotation = pluginHandle!!.pluginAnnotation
        if (annotation == null) {
            // Check for legacy plugin annotation, @NativePlugin
            val legacyAnnotation = pluginHandle!!.legacyPluginAnnotation
            return hasDefinedPermissions(legacyAnnotation.permissions)
        } else {
            for (perm in annotation.permissions) {
                for (permString in perm.strings) {
                    if (!PermissionHelper.hasDefinedPermission(context, permString)) {
                        return false
                    }
                }
            }
        }
        return true
    }

    /**
     * Checks if the given permission alias is correctly declared in AndroidManifest.xml
     * @param alias a permission alias defined on the plugin
     * @return true only if all permissions associated with the given alias are declared in the manifest
     */
    fun isPermissionDeclared(alias: String): Boolean {
        val annotation = pluginHandle!!.pluginAnnotation
        if (annotation != null) {
            for (perm in annotation.permissions) {
                if (alias.equals(perm.alias, ignoreCase = true)) {
                    var result = true
                    for (permString in perm.strings) {
                        result = result && PermissionHelper.hasDefinedPermission(context, permString)
                    }
                    return result
                }
            }
        }
        Logger.error(String.format("isPermissionDeclared: No alias defined for %s " + "or missing @CapacitorPlugin annotation.", alias))
        return false
    }

    /**
     * Check whether the given permission has been granted by the user
     * @param permission
     * @return
     */
    @Deprecated("""use {@link #getPermissionState(String)} and {@link #getPermissionStates()} to get
      the states of permissions defined on the Plugin in conjunction with the @CapacitorPlugin
      annotation. Use the Android API {@link ActivityCompat#checkSelfPermission(Context, String)}
      methods to check permissions with Android permission strings
     
      """)
    fun hasPermission(permission: String?): Boolean {
        return ActivityCompat.checkSelfPermission(context!!, permission!!) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * If the plugin annotation specified a set of permissions, this method checks if each is
     * granted
     * @return
     */
    @Deprecated("""use {@link #getPermissionState(String)} or {@link #getPermissionStates()} to
      check whether permissions are granted or not
     
      """)
    fun hasRequiredPermissions(): Boolean {
        val annotation = pluginHandle!!.pluginAnnotation
        if (annotation == null) {
            // Check for legacy plugin annotation, @NativePlugin
            val legacyAnnotation = pluginHandle!!.legacyPluginAnnotation
            for (perm in legacyAnnotation.permissions) {
                if (ActivityCompat.checkSelfPermission(context!!, perm) != PackageManager.PERMISSION_GRANTED) {
                    return false
                }
            }
            return true
        }
        for (perm in annotation.permissions) {
            for (permString in perm.strings) {
                if (ActivityCompat.checkSelfPermission(context!!, permString) != PackageManager.PERMISSION_GRANTED) {
                    return false
                }
            }
        }
        return true
    }

    /**
     * Request all of the specified permissions in the CapacitorPlugin annotation (if any)
     *
     * If there is no registered permission callback for the PluginCall passed in, the call will
     * be rejected. Make sure a valid permission callback method is registered using the
     * [PermissionCallback] annotation.
     *
     * @since 3.0.0
     * @param call the plugin call
     * @param callbackName the name of the callback to run when the permission request is complete
     */
    open fun requestAllPermissions(call: PluginCall, callbackName: String) {
        val annotation = pluginHandle!!.pluginAnnotation
        if (annotation != null) {
            val perms = HashSet<String>()
            for (perm in annotation.permissions) {
                perms.addAll(listOf(*perm.strings))
            }
            permissionActivityResult(call, perms.toTypedArray(), callbackName)
        }
    }

    /**
     * Request permissions using an alias defined on the plugin.
     *
     * If there is no registered permission callback for the PluginCall passed in, the call will
     * be rejected. Make sure a valid permission callback method is registered using the
     * [PermissionCallback] annotation.
     *
     * @param alias an alias defined on the plugin
     * @param call  the plugin call involved in originating the request
     * @param callbackName the name of the callback to run when the permission request is complete
     */
    open fun requestPermissionForAlias(alias: String, call: PluginCall, callbackName: String) {
        requestPermissionForAliases(arrayOf(alias), call, callbackName)
    }

    /**
     * Request permissions using aliases defined on the plugin.
     *
     * If there is no registered permission callback for the PluginCall passed in, the call will
     * be rejected. Make sure a valid permission callback method is registered using the
     * [PermissionCallback] annotation.
     *
     * @param aliases a set of aliases defined on the plugin
     * @param call    the plugin call involved in originating the request
     * @param callbackName the name of the callback to run when the permission request is complete
     */
    open fun requestPermissionForAliases(aliases: Array<String>, call: PluginCall, callbackName: String) {
        if (aliases.isEmpty()) {
            Logger.error("No permission alias was provided")
            return
        }
        val permissions = getPermissionStringsForAliases(aliases)
        if (permissions.isNotEmpty()) {
            permissionActivityResult(call, permissions, callbackName)
        }
    }

    /**
     * Gets the Android permission strings defined on the [CapacitorPlugin] annotation with
     * the provided aliases.
     *
     * @param aliases aliases for permissions defined on the plugin
     * @return Android permission strings associated with the provided aliases, if exists
     */
    private fun getPermissionStringsForAliases(aliases: Array<String>): Array<String> {
        val annotation = pluginHandle!!.pluginAnnotation
        val perms = HashSet<String>()
        for (perm in annotation.permissions) {
            if (listOf(*aliases).contains(perm.alias)) {
                perms.addAll(listOf(*perm.strings))
            }
        }
        return perms.toTypedArray()
    }

    /**
     * Gets the activity launcher associated with the calling methodName, or rejects the call if
     * no registered launcher exists
     *
     * @param call       the plugin call
     * @param methodName the name of the activity callback method
     * @return a launcher, or null if none found
     */
    private fun getActivityLauncherOrReject(call: PluginCall, methodName: String): ActivityResultLauncher<Intent>? {
        val activityLauncher = activityLaunchers[methodName]

        // if there is no registered launcher, reject the call with an error and return null
        if (activityLauncher == null) {
            var registerError = "There is no ActivityCallback method registered for the name: %s. " +
                    "Please define a callback method annotated with @ActivityCallback " +
                    "that receives arguments: (PluginCall, ActivityResult)"
            registerError = String.format(Locale.US, registerError, methodName)
            Logger.error(registerError)
            call.reject(registerError)
            return null
        }
        return activityLauncher
    }

    /**
     * Gets the permission launcher associated with the calling methodName, or rejects the call if
     * no registered launcher exists
     *
     * @param call       the plugin call
     * @param methodName the name of the permission callback method
     * @return a launcher, or null if none found
     */
    private fun getPermissionLauncherOrReject(call: PluginCall, methodName: String): ActivityResultLauncher<Array<String>>? {
        val permissionLauncher = permissionLaunchers[methodName]

        // if there is no registered launcher, reject the call with an error and return null
        if (permissionLauncher == null) {
            var registerError = "There is no PermissionCallback method registered for the name: %s. " +
                    "Please define a callback method annotated with @PermissionCallback " +
                    "that receives arguments: (PluginCall)"
            registerError = String.format(Locale.US, registerError, methodName)
            Logger.error(registerError)
            call.reject(registerError)
            return null
        }
        return permissionLauncher
    }

    /**
     * Request all of the specified permissions in the CapacitorPlugin annotation (if any)
     *
     */
    @Deprecated("use {@link #requestAllPermissions(PluginCall, String)} in conjunction with @CapacitorPlugin")
    fun pluginRequestAllPermissions() {
        val legacyAnnotation = pluginHandle!!.legacyPluginAnnotation
        ActivityCompat.requestPermissions(activity!!, legacyAnnotation.permissions, legacyAnnotation.permissionRequestCode)
    }

    /**
     * Helper for requesting a specific permission
     *
     * @param permission  the permission to request
     * @param requestCode the requestCode to use to associate the result with the plugin
     */
    @Deprecated("use {@link #requestPermissionForAlias(String, PluginCall, String)} in conjunction with @CapacitorPlugin")
    fun pluginRequestPermission(permission: String, requestCode: Int) {
        ActivityCompat.requestPermissions(activity!!, arrayOf(permission), requestCode)
    }

    /**
     * Helper for requesting specific permissions
     * @param permissions the set of permissions to request
     * @param requestCode the requestCode to use to associate the result with the plugin
     */
    @Deprecated("""use {@link #requestPermissionForAliases(String[], PluginCall, String)} in conjunction
      with @CapacitorPlugin
     
      """)
    fun pluginRequestPermissions(permissions: Array<String>, requestCode: Int) {
        ActivityCompat.requestPermissions(activity!!, permissions, requestCode)
    }

    /**
     * Get the permission state for the provided permission alias.
     *
     * @param alias the permission alias to get
     * @return the state of the provided permission alias or null
     */
    fun getPermissionState(alias: String): PermissionState? {
        return permissionStates[alias]
    }

    /**
     * Helper to check all permissions defined on a plugin and see the state of each.
     *
     * @since 3.0.0
     * @return A mapping of permission aliases to the associated granted status.
     */
    open val permissionStates: Map<String, PermissionState>
        get() = bridge!!.getPermissionStates(this)

    /**
     * Add a listener for the given event
     * @param eventName
     * @param call
     */
    private fun addEventListener(eventName: String?, call: PluginCall) {
        var listeners = eventListeners[eventName]
        if (listeners == null || listeners.isEmpty()) {
            listeners = ArrayList()
            eventListeners[eventName] = listeners

            // Must add the call before sending retained arguments
            listeners.add(call)
            sendRetainedArgumentsForEvent(eventName)
        } else {
            listeners.add(call)
        }
    }

    /**
     * Remove a listener from the given event
     * @param eventName
     * @param call
     */
    private fun removeEventListener(eventName: String?, call: PluginCall) {
        val listeners = eventListeners[eventName] ?: return
        listeners.remove(call)
    }
    /**
     * Notify all listeners that an event occurred
     * @param eventName
     * @param data
     */
    /**
     * Notify all listeners that an event occurred
     * This calls [Plugin.notifyListeners]
     * with retainUntilConsumed set to false
     * @param eventName
     * @param data
     */
    @JvmOverloads
    open fun notifyListeners(eventName: String?, data: JSObject?, retainUntilConsumed: Boolean = false) {
        Logger.verbose(logTag, "Notifying listeners for event $eventName")
        val listeners: List<PluginCall?>? = eventListeners[eventName]
        if (listeners == null || listeners.isEmpty()) {
            Logger.debug(logTag, "No listeners found for event $eventName")
            if (retainUntilConsumed) {
                retainedEventArguments[eventName] = data
            }
            return
        }
        val listenersCopy: CopyOnWriteArrayList<PluginCall?> = CopyOnWriteArrayList<PluginCall?>(listeners)
        for (call in listenersCopy) {
            call!!.resolve(data)
        }
    }

    /**
     * Check if there are any listeners for the given event
     */
    open fun hasListeners(eventName: String?): Boolean {
        val listeners = eventListeners[eventName]
                ?: return false
        return !listeners.isEmpty()
    }

    /**
     * Send retained arguments (if any) for this event. This
     * is called only when the first listener for an event is added
     * @param eventName
     */
    private fun sendRetainedArgumentsForEvent(eventName: String?) {
        val retained = retainedEventArguments[eventName] ?: return
        notifyListeners(eventName, retained)
        retainedEventArguments.remove(eventName)
    }

    /**
     * Exported plugin call for adding a listener to this plugin
     * @param call
     */
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun addListener(call: PluginCall) {
        val eventName = call.getString("eventName")
        call.setKeepAlive(true)
        addEventListener(eventName, call)
    }

    /**
     * Exported plugin call to remove a listener from this plugin
     * @param call
     */
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun removeListener(call: PluginCall) {
        val eventName = call.getString("eventName")
        val callbackId = call.getString("callbackId")
        val savedCall = bridge!!.getSavedCall(callbackId)
        if (savedCall != null) {
            removeEventListener(eventName, savedCall)
            bridge!!.releaseCall(savedCall)
        }
    }

    /**
     * Exported plugin call to remove all listeners from this plugin
     * @param call
     */
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    fun removeAllListeners(call: PluginCall?) {
        eventListeners.clear()
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
    open fun checkPermissions(pluginCall: PluginCall) {
        val permissionsResult = permissionStates
        if (permissionsResult.size == 0) {
            // if no permissions are defined on the plugin, resolve undefined
            pluginCall.resolve()
        } else {
            val permissionsResultJSON = JSObject()
            for ((key, value) in permissionsResult) {
                permissionsResultJSON.put(key, value)
            }
            pluginCall.resolve(permissionsResultJSON)
        }
    }

    /**
     * Exported plugin call to request all permissions for this plugin.
     * To manually request permissions within a plugin use:
     * [.requestAllPermissions], or
     * [.requestPermissionForAlias], or
     * [.requestPermissionForAliases]
     *
     * @param call the plugin call
     */
    @PluginMethod
    open fun requestPermissions(call: PluginCall) {
        val annotation = pluginHandle!!.pluginAnnotation
        if (annotation == null) {
            // handle permission requests for plugins defined with @NativePlugin (prior to 3.0.0)
            val legacyAnnotation = pluginHandle!!.legacyPluginAnnotation
            val perms: Array<String> = legacyAnnotation.permissions
            if (perms.size > 0) {
                saveCall(call)
                pluginRequestPermissions(perms, legacyAnnotation.permissionRequestCode)
            } else {
                call.resolve()
            }
        } else {
            // handle permission requests for plugins defined with @CapacitorPlugin (since 3.0.0)
            var permAliases: Array<String>? = null
            val autoGrantPerms: MutableSet<String> = HashSet()

            // If call was made with a list of specific permission aliases to request, save them
            // to be requested
            val providedPerms = call.getArray("permissions")
            var providedPermsList: List<String?>? = null
            try {
                providedPermsList = providedPerms.toList()
            } catch (ignore: JSONException) {
                // do nothing
            }

            // If call was made without any custom permissions, request all from plugin annotation
            val aliasSet: MutableSet<String> = HashSet()
            if (providedPermsList == null || providedPermsList.isEmpty()) {
                for (perm in annotation.permissions) {
                    // If a permission is defined with no permission strings, separate it for auto-granting.
                    // Otherwise, the alias is added to the list to be requested.
                    if (perm.strings.isEmpty() || perm.strings.size == 1 && perm.strings[0].isEmpty()) {
                        if (!perm.alias.isEmpty()) {
                            autoGrantPerms.add(perm.alias)
                        }
                    } else {
                        aliasSet.add(perm.alias)
                    }
                }
                permAliases = aliasSet.toTypedArray()
            } else {
                for (perm in annotation.permissions) {
                    if (providedPermsList.contains(perm.alias)) {
                        aliasSet.add(perm.alias)
                    }
                }
                if (aliasSet.isEmpty()) {
                    call.reject("No valid permission alias was requested of this plugin.")
                } else {
                    permAliases = aliasSet.toTypedArray()
                }
            }
            if (permAliases != null && permAliases.size > 0) {
                // request permissions using provided aliases or all defined on the plugin
                requestPermissionForAliases(permAliases, call, "checkPermissions")
            } else if (!autoGrantPerms.isEmpty()) {
                // if the plugin only has auto-grant permissions, return all as GRANTED
                val permissionsResults = JSObject()
                for (perm in autoGrantPerms) {
                    permissionsResults.put(perm, PermissionState.GRANTED.toString())
                }
                call.resolve(permissionsResults)
            } else {
                // no permissions are defined on the plugin, resolve undefined
                call.resolve()
            }
        }
    }

    /**
     * Handle request permissions result. A plugin using the deprecated [NativePlugin]
     * should override this to handle the result, or this method will handle the result
     * for our convenient requestPermissions call.
     * @param requestCode
     * @param permissions
     * @param grantResults
     */
    @Deprecated("""in favor of using callbacks in conjunction with {@link CapacitorPlugin}
     
      """)
    fun handleRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray?) {
        if (!hasDefinedPermissions(permissions)) {
            val builder = StringBuilder()
            builder.append("Missing the following permissions in AndroidManifest.xml:\n")
            val missing = PermissionHelper.getUndefinedPermissions(context, permissions)
            for (perm in missing) {
                builder.append("""
    $perm
    
    """.trimIndent())
            }
            savedCall!!.reject(builder.toString())
            savedCall = null
        }
    }

    /**
     * Called before the app is destroyed to give a plugin the chance to
     * save the last call options for a saved plugin. By default, this
     * method saves the full JSON blob of the options call. Since Bundle sizes
     * may be limited, plugins that expect to be called with large data
     * objects (such as a file), should override this method and selectively
     * store option values in a [Bundle] to avoid exceeding limits.
     * @return a new [Bundle] with fields set from the options of the last saved [PluginCall]
     */
    open fun saveInstanceState(): Bundle? {
        val savedCall = bridge!!.getSavedCall(lastPluginCallId) ?: return null
        val ret = Bundle()
        val callData = savedCall.data
        if (callData != null) {
            ret.putString(BUNDLE_PERSISTED_OPTIONS_JSON_KEY, callData.toString())
        }
        return ret
    }

    /**
     * Called when the app is opened with a previously un-handled
     * activity response. If the plugin that started the activity
     * stored data in [Plugin.saveInstanceState] then this
     * method will be called to allow the plugin to restore from that.
     * @param state
     */
    open fun restoreState(state: Bundle?) {}

    /**
     * Handle activity result, should be overridden by each plugin
     *
     * @param requestCode
     * @param resultCode
     * @param data
     */
    @Deprecated("""provide a callback method using the {@link ActivityCallback} annotation and use
      the {@link #startActivityForResult(PluginCall, Intent, String)} method
     
      """)
    open fun handleOnActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    }

    /**
     * Handle onNewIntent
     * @param intent
     */
    open fun handleOnNewIntent(intent: Intent?) {}

    /**
     * Handle onConfigurationChanged
     * @param newConfig
     */
    open fun handleOnConfigurationChanged(newConfig: Configuration?) {}

    /**
     * Handle onStart
     */
    open fun handleOnStart() {}

    /**
     * Handle onRestart
     */
    open fun handleOnRestart() {}

    /**
     * Handle onResume
     */
    open fun handleOnResume() {}

    /**
     * Handle onPause
     */
    open fun handleOnPause() {}

    /**
     * Handle onStop
     */
    open fun handleOnStop() {}

    /**
     * Handle onDestroy
     */
    open fun handleOnDestroy() {}

    /**
     * Give the plugins a chance to take control when a URL is about to be loaded in the WebView.
     * Returning true causes the WebView to abort loading the URL.
     * Returning false causes the WebView to continue loading the URL.
     * Returning null will defer to the default Capacitor policy
     */
    fun shouldOverrideLoad(url: Uri?): Boolean? {
        return null
    }

    /**
     * Start a new Activity.
     *
     * Note: This method must be used by all plugins instead of calling
     * [Activity.startActivityForResult] as it associates the plugin with
     * any resulting data from the new Activity even if this app
     * is destroyed by the OS (to free up memory, for example).
     * @param intent
     * @param resultCode
     */
    @Deprecated("")
    fun startActivityForResult(call: PluginCall?, intent: Intent?, resultCode: Int) {
        bridge!!.startActivityForPluginWithResult(call, intent, resultCode)
    }

    /**
     * Execute the given runnable on the Bridge's task handler
     * @param runnable
     */
    fun execute(runnable: Runnable?) {
        bridge!!.execute(runnable)
    }

    /**
     * Shortcut for getting the plugin log tag
     * @param subTags
     */
    open fun getLogTag(vararg subTags: String?): String {
        return Logger.tags(*subTags)
    }

    /**
     * Gets a plugin log tag with the child's class name as subTag.
     */
    open val logTag: String
        get() = Logger.tags(this.javaClass.simpleName)

    companion object {
        // The key we will use inside of a persisted Bundle for the JSON blob
        // for a plugin call options.
        private const val BUNDLE_PERSISTED_OPTIONS_JSON_KEY = "_json"
    }

    init {
        eventListeners = HashMap()
        retainedEventArguments = HashMap()
    }
}