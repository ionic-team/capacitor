package com.getcapacitor

import android.annotation.SuppressLint
import androidx.appcompat.app.AppCompatActivity
import com.getcapacitor.cordova.MockCordovaInterfaceImpl
import org.apache.cordova.CordovaPreferences
import com.getcapacitor.util.HostMask
import org.apache.cordova.CordovaWebView
import android.os.HandlerThread
import android.app.Activity
import android.content.Intent
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.pm.ApplicationInfo
import android.webkit.WebSettings
import com.getcapacitor.util.WebColor
import com.getcapacitor.annotation.CapacitorPlugin
import android.webkit.ValueCallback
import kotlin.jvm.JvmOverloads
import android.os.Bundle
import androidx.core.app.ActivityCompat
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.net.Uri
import android.os.Handler
import android.webkit.WebView
import androidx.activity.result.ActivityResultCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContract
import androidx.fragment.app.Fragment
import org.apache.cordova.ConfigXmlParser
import org.apache.cordova.PluginEntry
import com.getcapacitor.android.R
import com.getcapacitor.cordova.MockCordovaWebViewImpl
import com.getcapacitor.util.PermissionHelper
import org.apache.cordova.PluginManager
import org.json.JSONException
import java.io.File
import java.lang.Exception
import java.lang.IllegalArgumentException
import java.lang.RuntimeException
import java.lang.StringBuilder
import java.net.SocketTimeoutException
import java.net.URL
import java.util.*

/**
 * The Bridge class is the main engine of Capacitor. It manages
 * loading and communicating with all Plugins,
 * proxying Native events to Plugins, executing Plugin methods,
 * communicating with the WebView, and a whole lot more.
 *
 * Generally, you'll not use Bridge directly, instead, extend from BridgeActivity
 * to get a WebView instance and proxy native events automatically.
 *
 * If you want to use this Bridge in an existing Android app, please
 * see the source for BridgeActivity for the methods you'll need to
 * pass through to Bridge:
 * [
 * BridgeActivity.java](https://github.com/ionic-team/capacitor/blob/HEAD/android/capacitor/src/main/java/com/getcapacitor/BridgeActivity.java)
 */
class Bridge private constructor(
        context: AppCompatActivity?,
        fragment: Fragment?,
        webView: WebView,
        initialPlugins: List<Class<out Plugin>>,
        cordovaInterface: MockCordovaInterfaceImpl,
        pluginManager: PluginManager,
        preferences: CordovaPreferences,
        config: CapConfig?
) {
    // Loaded Capacitor config
    val config: CapConfig

    /**
     * Get the activity for the app
     * @return
     */
    // A reference to the main activity for the app
    val activity: AppCompatActivity?

    /**
     * Get the fragment for the app, if applicable. This will likely be null unless Capacitor
     * is being used embedded in a Native Android app.
     *
     * @return The fragment containing the Capacitor WebView.
     */
    // A reference to the containing Fragment if used
    val fragment: Fragment?
    var localServer: WebViewLocalServer? = null
        private set
    var localUrl: String? = null
        private set
    private var appUrl: String? = null
    private var appUrlConfig: String? = null
    var appAllowNavigationMask: HostMask? = null
        private set

    /**
     * Get the core WebView under Capacitor's control
     * @return
     */
    // A reference to the main WebView for the app
    val webView: WebView
    val cordovaInterface: MockCordovaInterfaceImpl
    private var cordovaWebView: CordovaWebView? = null
    private val preferences: CordovaPreferences
    var webViewClient: BridgeWebViewClient
    val app: App = App()

    // Our MessageHandler for sending and receiving data to the WebView
    private val msgHandler: MessageHandler

    // The ThreadHandler for executing plugin calls
    private val handlerThread = HandlerThread("CapacitorPlugins")

    // Our Handler for posting plugin calls. Created from the ThreadHandler
    private var taskHandler: Handler? = null
    private val initialPlugins: List<Class<out Plugin>>

    // A map of Plugin Id's to PluginHandle's
    private val plugins: MutableMap<String, PluginHandle> = HashMap()

    // Stored plugin calls that we're keeping around to call again someday
    private var savedCalls: MutableMap<String, PluginCall> = HashMap()

    // The call IDs of saved plugin calls with associated plugin id for handling permissions
    private val savedPermissionCallIds: MutableMap<String, LinkedList<String>> = HashMap()

    // Store a plugin that started a new activity, in case we need to resume
    // the app and return that data back
    private var pluginCallForLastActivity: PluginCall? = null

    /**
     * Get the URI that was used to launch the app (if any)
     * @return
     */
    // Any URI that was passed to the app on start
    val intentUri: Uri?

    // A list of listeners that trigger when webView events occur
    private var webViewListeners: MutableList<WebViewListener> = ArrayList()

    /**
     * Create the Bridge with a reference to the main [Activity] for the
     * app, and a reference to the [WebView] our app will use.
     * @param context
     * @param webView
     */
    @Deprecated("Use {@link Bridge.Builder} to create Bridge instances")
    constructor(
            context: AppCompatActivity?,
            webView: WebView,
            initialPlugins: List<Class<out Plugin>>,
            cordovaInterface: MockCordovaInterfaceImpl,
            pluginManager: PluginManager,
            preferences: CordovaPreferences,
            config: CapConfig?
    ) : this(context, null, webView, initialPlugins, cordovaInterface, pluginManager, preferences, config) {
    }

    private fun loadWebView() {
        appUrlConfig = serverUrl
        val appAllowNavigationConfig = config.allowNavigation
        val authorities = ArrayList<String>()
        if (appAllowNavigationConfig != null) {
            authorities.addAll(listOf(*appAllowNavigationConfig))
        }
        appAllowNavigationMask = HostMask.Parser.parse(appAllowNavigationConfig)
        val authority = host
        authorities.add(authority)
        val scheme = scheme
        localUrl = "$scheme://$authority"
        if (appUrlConfig != null) {
            try {
                val appUrlObject = URL(appUrlConfig)
                authorities.add(appUrlObject.authority)
            } catch (ex: Exception) {
            }
            localUrl = appUrlConfig
            appUrl = appUrlConfig
        } else {
            appUrl = localUrl
            // custom URL schemes requires path ending with /
            if (scheme != CAPACITOR_HTTP_SCHEME && scheme != CAPACITOR_HTTPS_SCHEME) {
                appUrl += "/"
            }
        }
        val appUrlPath = config.startPath
        if (appUrlPath != null && !appUrlPath.trim { it <= ' ' }.isEmpty()) {
            appUrl += appUrlPath
        }
        val html5mode = config.isHTML5Mode

        // Start the local web server
        localServer = WebViewLocalServer(activity, this, jSInjector, authorities, html5mode)
        localServer!!.hostAssets(DEFAULT_WEB_ASSET_DIR)
        Logger.debug("Loading app at $appUrl")
        webView.webChromeClient = BridgeWebChromeClient(this)
        webView.webViewClient = webViewClient
        if (!isDeployDisabled && !isNewBinary) {
            val prefs = getContext()!!.getSharedPreferences(com.getcapacitor.plugin.WebView.WEBVIEW_PREFS_NAME, Activity.MODE_PRIVATE)
            val path = prefs.getString(com.getcapacitor.plugin.WebView.CAP_SERVER_PATH, null)
            if (path != null && !path.isEmpty() && File(path).exists()) {
                serverBasePath = path
            }
        }
        // Get to work
        webView.loadUrl(appUrl!!)
    }

    fun launchIntent(url: Uri): Boolean {
        /*
         * Give plugins the chance to handle the url
         */
        for ((_, value) in plugins) {
            val plugin = value.instance
            if (plugin != null) {
                val shouldOverrideLoad = plugin.shouldOverrideLoad(url)
                if (shouldOverrideLoad != null) {
                    return shouldOverrideLoad
                }
            }
        }
        if (!url.toString().contains(appUrl!!) && !appAllowNavigationMask!!.matches(url.host)) {
            try {
                val openIntent = Intent(Intent.ACTION_VIEW, url)
                getContext()!!.startActivity(openIntent)
            } catch (e: ActivityNotFoundException) {
                // TODO - trigger an event
            }
            return true
        }
        return false
    }

    private val isNewBinary: Boolean
        get() {
            var versionCode = ""
            var versionName = ""
            val prefs = getContext()!!.getSharedPreferences(com.getcapacitor.plugin.WebView.WEBVIEW_PREFS_NAME, Activity.MODE_PRIVATE)
            val lastVersionCode = prefs.getString(LAST_BINARY_VERSION_CODE, null)
            val lastVersionName = prefs.getString(LAST_BINARY_VERSION_NAME, null)
            try {
                val pInfo = getContext()!!.packageManager.getPackageInfo(getContext()!!.packageName, 0)
                versionCode = Integer.toString(pInfo.versionCode)
                versionName = pInfo.versionName
            } catch (ex: Exception) {
                Logger.error("Unable to get package info", ex)
            }
            if (versionCode != lastVersionCode || versionName != lastVersionName) {
                val editor = prefs.edit()
                editor.putString(LAST_BINARY_VERSION_CODE, versionCode)
                editor.putString(LAST_BINARY_VERSION_NAME, versionName)
                editor.putString(com.getcapacitor.plugin.WebView.CAP_SERVER_PATH, "")
                editor.apply()
                return true
            }
            return false
        }
    val isDeployDisabled: Boolean
        get() = preferences.getBoolean("DisableDeploy", false)

    fun shouldKeepRunning(): Boolean {
        return preferences.getBoolean("KeepRunning", true)
    }

    fun handleAppUrlLoadError(ex: Exception?) {
        if (ex is SocketTimeoutException) {
            Logger.error(
                    "Unable to load app. Ensure the server is running at " +
                            appUrl +
                            ", or modify the " +
                            "appUrl setting in capacitor.config.json (make sure to npx cap copy after to commit changes).",
                    ex
            )
        }
    }

    val isDevMode: Boolean
        get() = activity!!.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0

    protected fun setCordovaWebView(cordovaWebView: CordovaWebView?) {
        this.cordovaWebView = cordovaWebView
    }

    /**
     * Get the Context for the App
     * @return
     */
    fun getContext(): Context? {
        return activity
    }

    /**
     * Get scheme that is used to serve content
     * @return
     */
    val scheme: String
        get() = config.androidScheme

    /**
     * Get host name that is used to serve content
     * @return
     */
    val host: String
        get() = config.hostname

    /**
     * Get the server url that is used to serve content
     * @return
     */
    val serverUrl: String?
        get() = config.serverUrl

    fun reset() {
        savedCalls = HashMap()
    }

    /**
     * Initialize the WebView, setting required flags
     */
    @SuppressLint("SetJavaScriptEnabled")
    private fun initWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.setGeolocationEnabled(true)
        settings.databaseEnabled = true
        settings.setAppCacheEnabled(true)
        settings.mediaPlaybackRequiresUserGesture = false
        settings.javaScriptCanOpenWindowsAutomatically = true
        if (config.isMixedContentAllowed) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }
        val appendUserAgent = config.appendedUserAgentString
        if (appendUserAgent != null) {
            val defaultUserAgent = settings.userAgentString
            settings.userAgentString = "$defaultUserAgent $appendUserAgent"
        }
        val overrideUserAgent = config.overriddenUserAgentString
        if (overrideUserAgent != null) {
            settings.userAgentString = overrideUserAgent
        }
        val backgroundColor = config.backgroundColor
        try {
            if (backgroundColor != null) {
                webView.setBackgroundColor(WebColor.parseColor(backgroundColor))
            }
        } catch (ex: IllegalArgumentException) {
            Logger.debug("WebView background color not applied")
        }
        webView.requestFocusFromTouch()
        WebView.setWebContentsDebuggingEnabled(config.isWebContentsDebuggingEnabled)
    }

    /**
     * Register our core Plugin APIs
     */
    private fun registerAllPlugins() {
        registerPlugin(com.getcapacitor.plugin.WebView::class.java)
        for (pluginClass in initialPlugins) {
            registerPlugin(pluginClass)
        }
    }

    /**
     * Register additional plugins
     * @param pluginClasses the plugins to register
     */
    fun registerPlugins(pluginClasses: Array<Class<out Plugin>>) {
        for (plugin in pluginClasses) {
            registerPlugin(plugin)
        }
    }

    /**
     * Register a plugin class
     * @param pluginClass a class inheriting from Plugin
     */
    fun registerPlugin(pluginClass: Class<out Plugin>) {
        val pluginName: String
        val pluginAnnotation = pluginClass.getAnnotation(CapacitorPlugin::class.java)
        if (pluginAnnotation == null) {
            val legacyPluginAnnotation = pluginClass.getAnnotation(NativePlugin::class.java)
            if (legacyPluginAnnotation == null) {
                Logger.error("Plugin doesn't have the @CapacitorPlugin annotation. Please add it")
                return
            }
            pluginName = legacyPluginAnnotation.name
        } else {
            pluginName = pluginAnnotation.name
        }
        var pluginId = pluginClass.simpleName

        // Use the supplied name as the id if available
        if (pluginName != "") {
            pluginId = pluginName
        }
        Logger.debug("Registering plugin: $pluginId")
        try {
            plugins[pluginId] = PluginHandle(this, pluginClass)
        } catch (ex: InvalidPluginException) {
            Logger.error(
                    "NativePlugin " +
                            pluginClass.name +
                            " is invalid. Ensure the @CapacitorPlugin annotation exists on the plugin class and" +
                            " the class extends Plugin"
            )
        } catch (ex: PluginLoadException) {
            Logger.error("NativePlugin " + pluginClass.name + " failed to load", ex)
        }
    }

    fun getPlugin(pluginId: String): PluginHandle? {
        return plugins[pluginId]
    }

    /**
     * Find the plugin handle that responds to the given request code. This will
     * fire after certain Android OS intent results/permission checks/etc.
     * @param requestCode
     * @return
     */
    @Deprecated("")
    fun getPluginWithRequestCode(requestCode: Int): PluginHandle? {
        for (handle in plugins.values) {
            var requestCodes: IntArray
            val pluginAnnotation = handle.pluginAnnotation
            if (pluginAnnotation == null) {
                // Check for legacy plugin annotation, @NativePlugin
                val legacyPluginAnnotation = handle.legacyPluginAnnotation ?: continue
                if (legacyPluginAnnotation.permissionRequestCode == requestCode) {
                    return handle
                }
                requestCodes = legacyPluginAnnotation.requestCodes
                for (rc in requestCodes) {
                    if (rc == requestCode) {
                        return handle
                    }
                }
            } else {
                requestCodes = pluginAnnotation.requestCodes
                for (rc in requestCodes) {
                    if (rc == requestCode) {
                        return handle
                    }
                }
            }
        }
        return null
    }

    /**
     * Call a method on a plugin.
     * @param pluginId the plugin id to use to lookup the plugin handle
     * @param methodName the name of the method to call
     * @param call the call object to pass to the method
     */
    fun callPluginMethod(pluginId: String, methodName: String, call: PluginCall) {
        try {
            val plugin = getPlugin(pluginId)
            if (plugin == null) {
                Logger.error("unable to find plugin : $pluginId")
                call.errorCallback("unable to find plugin : $pluginId")
                return
            }
            Logger.verbose(
                    "callback: " +
                            call.callbackId +
                            ", pluginId: " +
                            plugin.id +
                            ", methodName: " +
                            methodName +
                            ", methodData: " +
                            call.data.toString()
            )
            val currentThreadTask = Runnable {
                try {
                    plugin.invoke(methodName, call)
                    if (call.isKeptAlive) {
                        saveCall(call)
                    }
                } catch (ex: PluginLoadException) {
                    Logger.error("Unable to execute plugin method", ex)
                } catch (ex: InvalidPluginMethodException) {
                    Logger.error("Unable to execute plugin method", ex)
                } catch (ex: Exception) {
                    Logger.error("Serious error executing plugin", ex)
                    throw RuntimeException(ex)
                }
            }
            taskHandler!!.post(currentThreadTask)
        } catch (ex: Exception) {
            Logger.error(Logger.tags("callPluginMethod"), "error : $ex", null)
            call.errorCallback(ex.toString())
        }
    }

    /**
     * Evaluate JavaScript in the web view. This method
     * executes on the main thread automatically.
     * @param js the JS to execute
     * @param callback an optional ValueCallback that will synchronously receive a value
     * after calling the JS
     */
    fun eval(js: String?, callback: ValueCallback<String?>?) {
        val mainHandler = Handler(activity!!.mainLooper)
        mainHandler.post { webView.evaluateJavascript(js!!, callback) }
    }

    @JvmOverloads
    fun logToJs(message: String, level: String = "log") {
        eval("window.Capacitor.logJs(\"$message\", \"$level\")", null)
    }

    fun triggerJSEvent(eventName: String, target: String) {
        eval("window.Capacitor.triggerEvent(\"$eventName\", \"$target\")") { s: String? -> }
    }

    fun triggerJSEvent(eventName: String, target: String, data: String) {
        eval("window.Capacitor.triggerEvent(\"$eventName\", \"$target\", $data)") { s: String? -> }
    }

    fun triggerWindowJSEvent(eventName: String) {
        this.triggerJSEvent(eventName, "window")
    }

    fun triggerWindowJSEvent(eventName: String, data: String) {
        this.triggerJSEvent(eventName, "window", data)
    }

    fun triggerDocumentJSEvent(eventName: String) {
        this.triggerJSEvent(eventName, "document")
    }

    fun triggerDocumentJSEvent(eventName: String, data: String) {
        this.triggerJSEvent(eventName, "document", data)
    }

    fun execute(runnable: Runnable?) {
        taskHandler!!.post(runnable!!)
    }

    fun executeOnMainThread(runnable: Runnable?) {
        val mainHandler = Handler(activity!!.mainLooper)
        mainHandler.post(runnable!!)
    }

    /**
     * Retain a call between plugin invocations
     * @param call
     */
    fun saveCall(call: PluginCall) {
        savedCalls[call.callbackId] = call
    }

    /**
     * Get a retained plugin call
     * @param callbackId the callbackId to use to lookup the call with
     * @return the stored call
     */
    fun getSavedCall(callbackId: String?): PluginCall? {
        return if (callbackId == null) {
            null
        } else savedCalls[callbackId]
    }

    fun getPluginCallForLastActivity(): PluginCall? {
        val pluginCallForLastActivity = pluginCallForLastActivity
        this.pluginCallForLastActivity = null
        return pluginCallForLastActivity
    }

    fun setPluginCallForLastActivity(pluginCallForLastActivity: PluginCall?) {
        this.pluginCallForLastActivity = pluginCallForLastActivity
    }

    /**
     * Release a retained call
     * @param call a call to release
     */
    fun releaseCall(call: PluginCall) {
        releaseCall(call.callbackId)
    }

    /**
     * Release a retained call by its ID
     * @param callbackId an ID of a callback to release
     */
    fun releaseCall(callbackId: String) {
        savedCalls.remove(callbackId)
    }

    /**
     * Removes the earliest saved call prior to a permissions request for a given plugin and
     * returns it.
     *
     * @return The saved plugin call
     */
    fun getPermissionCall(pluginId: String): PluginCall? {
        val permissionCallIds = savedPermissionCallIds[pluginId]
        var savedCallId: String? = null
        if (permissionCallIds != null) {
            savedCallId = permissionCallIds.poll()
        }
        return getSavedCall(savedCallId)
    }

    /**
     * Save a call to be retrieved after requesting permissions. Calls are saved in order.
     *
     * @param call The plugin call to save.
     */
    fun savePermissionCall(call: PluginCall?) {
        if (call != null) {
            if (!savedPermissionCallIds.containsKey(call.pluginId)) {
                savedPermissionCallIds[call.pluginId] = LinkedList()
            }
            savedPermissionCallIds[call.pluginId]!!.add(call.callbackId)
            saveCall(call)
        }
    }

    /**
     * Register an Activity Result Launcher to the containing Fragment or Activity.
     *
     * @param contract A contract specifying that an activity can be called with an input of
     * type I and produce an output of type O.
     * @param callback The callback run on Activity Result.
     * @return A registered Activity Result Launcher.
     */
    fun <I, O> registerForActivityResult(
            contract: ActivityResultContract<I, O>,
            callback: ActivityResultCallback<O>
    ): ActivityResultLauncher<I> {
        return fragment?.registerForActivityResult(contract, callback)
                ?: activity!!.registerForActivityResult(contract, callback)
    }

    /**
     * Build the JSInjector that will be used to inject JS into files served to the app,
     * to ensure that Capacitor's JS and the JS for all the plugins is loaded each time.
     */
    private val jSInjector: JSInjector?
        get() {
            try {
                val globalJS = JSExport.getGlobalJS(activity, config.isLoggingEnabled, isDevMode)
                val bridgeJS = JSExport.getBridgeJS(activity)
                val pluginJS = JSExport.getPluginJS(plugins.values)
                val cordovaJS = JSExport.getCordovaJS(activity)
                val cordovaPluginsJS = JSExport.getCordovaPluginJS(activity)
                val cordovaPluginsFileJS = JSExport.getCordovaPluginsFileJS(activity)
                val localUrlJS = "window.WEBVIEW_SERVER_URL = '$localUrl';"
                return JSInjector(globalJS, bridgeJS, pluginJS, cordovaJS, cordovaPluginsJS, cordovaPluginsFileJS, localUrlJS)
            } catch (ex: Exception) {
                Logger.error("Unable to export Capacitor JS. App will not function!", ex)
            }
            return null
        }

    /**
     * Restore any saved bundle state data
     * @param savedInstanceState
     */
    fun restoreInstanceState(savedInstanceState: Bundle) {
        val lastPluginId = savedInstanceState.getString(BUNDLE_LAST_PLUGIN_ID_KEY)
        val lastPluginCallMethod = savedInstanceState.getString(BUNDLE_LAST_PLUGIN_CALL_METHOD_NAME_KEY)
        val lastOptionsJson = savedInstanceState.getString(BUNDLE_PLUGIN_CALL_OPTIONS_SAVED_KEY)
        if (lastPluginId != null) {
            // If we have JSON blob saved, create a new plugin call with the original options
            if (lastOptionsJson != null) {
                try {
                    val options = JSObject(lastOptionsJson)
                    pluginCallForLastActivity = PluginCall(msgHandler, lastPluginId, PluginCall.CALLBACK_ID_DANGLING, lastPluginCallMethod, options)
                } catch (ex: JSONException) {
                    Logger.error("Unable to restore plugin call, unable to parse persisted JSON object", ex)
                }
            }

            // Let the plugin restore any state it needs
            val bundleData = savedInstanceState.getBundle(BUNDLE_PLUGIN_CALL_BUNDLE_KEY)
            val lastPlugin = getPlugin(lastPluginId)
            if (bundleData != null && lastPlugin != null) {
                lastPlugin.instance.restoreState(bundleData)
            } else {
                Logger.error("Unable to restore last plugin call")
            }
        }
    }

    fun saveInstanceState(outState: Bundle) {
        Logger.debug("Saving instance state!")

        // If there was a last PluginCall for a started activity, we need to
        // persist it so we can load it again in case our app gets terminated
        if (pluginCallForLastActivity != null) {
            val call: PluginCall = pluginCallForLastActivity as PluginCall
            val handle = getPlugin(call.pluginId)
            if (handle != null) {
                val bundle = handle.instance.saveInstanceState()
                if (bundle != null) {
                    outState.putString(BUNDLE_LAST_PLUGIN_ID_KEY, call.pluginId)
                    outState.putString(BUNDLE_LAST_PLUGIN_CALL_METHOD_NAME_KEY, call.methodName)
                    outState.putString(BUNDLE_PLUGIN_CALL_OPTIONS_SAVED_KEY, call.data.toString())
                    outState.putBundle(BUNDLE_PLUGIN_CALL_BUNDLE_KEY, bundle)
                } else {
                    Logger.error("Couldn't save last " + call.pluginId + "'s Plugin " + call.methodName + " call")
                }
            }
        }
    }

    @Deprecated("")
    fun startActivityForPluginWithResult(call: PluginCall?, intent: Intent?, requestCode: Int) {
        Logger.debug("Starting activity for result")
        pluginCallForLastActivity = call
        activity!!.startActivityForResult(intent, requestCode)
    }

    /**
     * Check for legacy Capacitor or Cordova plugins that may have registered to handle a permission
     * request, and handle them if so. If not handled, false is returned.
     *
     * @param requestCode the code that was requested
     * @param permissions the permissions requested
     * @param grantResults the set of granted/denied permissions
     * @return true if permission code was handled by a plugin explicitly, false if not
     */
    fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray?): Boolean {
        val plugin = getPluginWithRequestCode(requestCode)
        if (plugin == null) {
            var permissionHandled = false
            Logger.debug("Unable to find a Capacitor plugin to handle permission requestCode, trying Cordova plugins $requestCode")
            try {
                permissionHandled = cordovaInterface.handlePermissionResult(requestCode, permissions, grantResults)
            } catch (e: JSONException) {
                Logger.debug("Error on Cordova plugin permissions request " + e.message)
            }
            return permissionHandled
        }

        // Call deprecated method if using deprecated NativePlugin annotation
        if (plugin.pluginAnnotation == null) {
            plugin.instance.handleRequestPermissionsResult(requestCode, permissions, grantResults)
            return true
        }
        return false
    }

    /**
     * Saves permission states and rejects if permissions were not correctly defined in
     * the AndroidManifest.xml file.
     *
     * @param plugin
     * @param savedCall
     * @param permissions
     * @return true if permissions were saved and defined correctly, false if not
     */
    fun validatePermissions(plugin: Plugin?, savedCall: PluginCall, permissions: Map<String, Boolean>): Boolean {
        val prefs = getContext()!!.getSharedPreferences(PERMISSION_PREFS_NAME, Activity.MODE_PRIVATE)
        for ((permString, isGranted) in permissions) {
            if (isGranted) {
                // Permission granted. If previously denied, remove cached state
                val state = prefs.getString(permString, null)
                if (state != null) {
                    val editor = prefs.edit()
                    editor.remove(permString)
                    editor.apply()
                }
            } else {
                val editor = prefs.edit()
                if (ActivityCompat.shouldShowRequestPermissionRationale(activity!!, permString)) {
                    // Permission denied, can prompt again with rationale
                    editor.putString(permString, PermissionState.PROMPT_WITH_RATIONALE.toString())
                } else {
                    // Permission denied permanently, store this state for future reference
                    editor.putString(permString, PermissionState.DENIED.toString())
                }
                editor.apply()
            }
        }
        val permStrings = permissions.keys.toTypedArray()
        if (!PermissionHelper.hasDefinedPermissions(getContext(), permStrings)) {
            val builder = StringBuilder()
            builder.append("Missing the following permissions in AndroidManifest.xml:\n")
            val missing = PermissionHelper.getUndefinedPermissions(getContext(), permStrings)
            for (perm in missing) {
                builder.append("""
    $perm
    
    """.trimIndent())
            }
            savedCall.reject(builder.toString())
            return false
        }
        return true
    }

    /**
     * Helper to check all permissions and see the current states of each permission.
     *
     * @since 3.0.0
     * @return A mapping of permission aliases to the associated granted status.
     */
    fun getPermissionStates(plugin: Plugin): Map<String, PermissionState> {
        val permissionsResults: MutableMap<String, PermissionState> = HashMap()
        val annotation = plugin.pluginHandle!!.pluginAnnotation
        for (perm in annotation.permissions) {
            // If a permission is defined with no permission constants, return GRANTED for it.
            // Otherwise, get its true state.
            if (perm.strings.isEmpty() || perm.strings.size == 1 && perm.strings[0].isEmpty()) {
                val key: String = perm.alias
                if (!key.isEmpty()) {
                    val existingResult = permissionsResults[key]

                    // auto set permission state to GRANTED if the alias is empty.
                    if (existingResult == null) {
                        permissionsResults[key] = PermissionState.GRANTED
                    }
                }
            } else {
                for (permString in perm.strings) {
                    val key = if (perm.alias.isEmpty()) permString else perm.alias
                    var permissionStatus: PermissionState
                    if (ActivityCompat.checkSelfPermission(getContext()!!, permString) == PackageManager.PERMISSION_GRANTED) {
                        permissionStatus = PermissionState.GRANTED
                    } else {
                        permissionStatus = PermissionState.PROMPT

                        // Check if there is a cached permission state for the "Never ask again" state
                        val prefs = getContext()!!.getSharedPreferences(PERMISSION_PREFS_NAME, Activity.MODE_PRIVATE)
                        val state = prefs.getString(permString, null)
                        if (state != null) {
                            permissionStatus = PermissionState.byState(state)
                        }
                    }
                    val existingResult = permissionsResults[key]

                    // multiple permissions with the same alias must all be true, otherwise all false.
                    if (existingResult == null || existingResult == PermissionState.GRANTED) {
                        permissionsResults[key] = permissionStatus
                    }
                }
            }
        }
        return permissionsResults
    }

    /**
     * Handle an activity result and pass it to a plugin that has indicated it wants to
     * handle the result.
     * @param requestCode
     * @param resultCode
     * @param data
     */
    fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?): Boolean {
        val plugin = getPluginWithRequestCode(requestCode)
        if (plugin == null || plugin.instance == null) {
            Logger.debug("Unable to find a Capacitor plugin to handle requestCode, trying Cordova plugins $requestCode")
            return cordovaInterface.onActivityResult(requestCode, resultCode, data)
        }

        // deprecated, to be removed
        val lastCall = plugin.instance.savedCall

        // If we don't have a saved last call (because our app was killed and restarted, for example),
        // Then we should see if we have any saved plugin call information and generate a new,
        // "dangling" plugin call (a plugin call that doesn't have a corresponding web callback)
        // and then send that to the plugin
        if (lastCall == null && pluginCallForLastActivity != null) {
            plugin.instance.saveCall(pluginCallForLastActivity)
        }
        plugin.instance.handleOnActivityResult(requestCode, resultCode, data)

        // Clear the plugin call we may have re-hydrated on app launch
        pluginCallForLastActivity = null
        return true
    }

    /**
     * Handle an onNewIntent lifecycle event and notify the plugins
     * @param intent
     */
    fun onNewIntent(intent: Intent?) {
        for (plugin in plugins.values) {
            plugin.instance.handleOnNewIntent(intent)
        }
        if (cordovaWebView != null) {
            cordovaWebView!!.onNewIntent(intent)
        }
    }

    /**
     * Handle an onConfigurationChanged event and notify the plugins
     * @param newConfig
     */
    fun onConfigurationChanged(newConfig: Configuration?) {
        for (plugin in plugins.values) {
            plugin.instance.handleOnConfigurationChanged(newConfig)
        }
    }

    /**
     * Handle onRestart lifecycle event and notify the plugins
     */
    fun onRestart() {
        for (plugin in plugins.values) {
            plugin.instance.handleOnRestart()
        }
    }

    /**
     * Handle onStart lifecycle event and notify the plugins
     */
    fun onStart() {
        for (plugin in plugins.values) {
            plugin.instance.handleOnStart()
        }
        if (cordovaWebView != null) {
            cordovaWebView!!.handleStart()
        }
    }

    /**
     * Handle onResume lifecycle event and notify the plugins
     */
    fun onResume() {
        for (plugin in plugins.values) {
            plugin.instance.handleOnResume()
        }
        if (cordovaWebView != null) {
            cordovaWebView!!.handleResume(shouldKeepRunning())
        }
    }

    /**
     * Handle onPause lifecycle event and notify the plugins
     */
    fun onPause() {
        for (plugin in plugins.values) {
            plugin.instance.handleOnPause()
        }
        if (cordovaWebView != null) {
            val keepRunning = shouldKeepRunning() || cordovaInterface.activityResultCallback != null
            cordovaWebView!!.handlePause(keepRunning)
        }
    }

    /**
     * Handle onStop lifecycle event and notify the plugins
     */
    fun onStop() {
        for (plugin in plugins.values) {
            plugin.instance.handleOnStop()
        }
        if (cordovaWebView != null) {
            cordovaWebView!!.handleStop()
        }
    }

    /**
     * Handle onDestroy lifecycle event and notify the plugins
     */
    fun onDestroy() {
        for (plugin in plugins.values) {
            plugin.instance.handleOnDestroy()
        }
        handlerThread.quitSafely()
        if (cordovaWebView != null) {
            cordovaWebView!!.handleDestroy()
        }
    }

    /**
     * Handle onDetachedFromWindow lifecycle event
     */
    fun onDetachedFromWindow() {
        webView.removeAllViews()
        webView.destroy()
    }

    /**
     * Tell the local server to load files from the given
     * file path instead of the assets path.
     * @param path
     */
    var serverBasePath: String?
        get() = localServer!!.basePath
        set(path) {
            localServer!!.hostFiles(path)
            webView.post { webView.loadUrl(appUrl!!) }
        }

    /**
     * Tell the local server to load files from the given
     * asset path.
     * @param path
     */
    fun setServerAssetPath(path: String?) {
        localServer!!.hostAssets(path)
        webView.post { webView.loadUrl(appUrl!!) }
    }

    /**
     * Reload the WebView
     */
    fun reload() {
        webView.post { webView.loadUrl(appUrl!!) }
    }

    fun getWebViewListeners(): List<WebViewListener> {
        return webViewListeners
    }

    fun setWebViewListeners(webViewListeners: MutableList<WebViewListener>) {
        this.webViewListeners = webViewListeners
    }

    /**
     * Add a listener that the WebViewClient can trigger on certain events.
     * @param webViewListener A [WebViewListener] to add.
     */
    fun addWebViewListener(webViewListener: WebViewListener) {
        webViewListeners.add(webViewListener)
    }

    /**
     * Remove a listener that the WebViewClient triggers on certain events.
     * @param webViewListener A [WebViewListener] to remove.
     */
    fun removeWebViewListener(webViewListener: WebViewListener) {
        webViewListeners.remove(webViewListener)
    }

    class Builder {
        private var instanceState: Bundle? = null
        private var config: CapConfig? = null
        private var plugins: MutableList<Class<out Plugin>> = ArrayList()
        private var activity: AppCompatActivity?
        private var fragment: Fragment? = null
        private val webViewListeners: MutableList<WebViewListener> = ArrayList()

        constructor(activity: AppCompatActivity?) {
            this.activity = activity
        }

        constructor(fragment: Fragment) {
            activity = fragment.activity as AppCompatActivity?
            this.fragment = fragment
        }

        fun setInstanceState(instanceState: Bundle?): Builder {
            this.instanceState = instanceState
            return this
        }

        fun setConfig(config: CapConfig?): Builder {
            this.config = config
            return this
        }

        fun setPlugins(plugins: MutableList<Class<out Plugin>>): Builder {
            this.plugins = plugins
            return this
        }

        fun addPlugin(plugin: Class<out Plugin>): Builder {
            plugins.add(plugin)
            return this
        }

        fun addPlugins(plugins: List<Class<out Plugin>>): Builder {
            for (cls in plugins) {
                addPlugin(cls)
            }
            return this
        }

        fun addWebViewListener(webViewListener: WebViewListener): Builder {
            webViewListeners.add(webViewListener)
            return this
        }

        fun addWebViewListeners(webViewListeners: List<WebViewListener>): Builder {
            for (listener in webViewListeners) {
                addWebViewListener(listener)
            }
            return this
        }

        fun create(): Bridge {
            // Cordova initialization
            val parser = ConfigXmlParser()
            parser.parse(activity!!.applicationContext)
            val preferences = parser.preferences
            preferences.setPreferencesBundle(activity!!.intent.extras)
            val pluginEntries: List<PluginEntry> = parser.pluginEntries
            val cordovaInterface = MockCordovaInterfaceImpl(activity)
            if (instanceState != null) {
                cordovaInterface.restoreInstanceState(instanceState)
            }
            val webView = if (fragment != null) fragment!!.requireView().findViewById(R.id.webview) else activity!!.findViewById<WebView>(R.id.webview)
            val mockWebView = MockCordovaWebViewImpl(activity!!.applicationContext)
            mockWebView.init(cordovaInterface, pluginEntries, preferences, webView)
            val pluginManager = mockWebView.pluginManager
            cordovaInterface.onCordovaInit(pluginManager)

            // Bridge initialization
            val bridge = Bridge(activity, fragment, webView, plugins, cordovaInterface, pluginManager, preferences, config)
            bridge.setCordovaWebView(mockWebView)
            bridge.setWebViewListeners(webViewListeners)
            if (instanceState != null) {
                bridge.restoreInstanceState(instanceState!!)
            }
            return bridge
        }
    }

    companion object {
        private const val PREFS_NAME = "CapacitorSettings"
        private const val PERMISSION_PREFS_NAME = "PluginPermStates"
        private const val BUNDLE_LAST_PLUGIN_ID_KEY = "capacitorLastActivityPluginId"
        private const val BUNDLE_LAST_PLUGIN_CALL_METHOD_NAME_KEY = "capacitorLastActivityPluginMethod"
        private const val BUNDLE_PLUGIN_CALL_OPTIONS_SAVED_KEY = "capacitorLastPluginCallOptions"
        private const val BUNDLE_PLUGIN_CALL_BUNDLE_KEY = "capacitorLastPluginCallBundle"
        private const val LAST_BINARY_VERSION_CODE = "lastBinaryVersionCode"
        private const val LAST_BINARY_VERSION_NAME = "lastBinaryVersionName"

        // The name of the directory we use to look for index.html and the rest of our web assets
        const val DEFAULT_WEB_ASSET_DIR = "public"
        const val CAPACITOR_HTTP_SCHEME = "http"
        const val CAPACITOR_HTTPS_SCHEME = "https"
        const val CAPACITOR_FILE_START = "/_capacitor_file_"
        const val CAPACITOR_CONTENT_START = "/_capacitor_content_"
    }

    init {
        activity = context
        this.fragment = fragment
        this.webView = webView
        webViewClient = BridgeWebViewClient(this)
        this.initialPlugins = initialPlugins
        this.cordovaInterface = cordovaInterface
        this.preferences = preferences

        // Start our plugin execution threads and handlers
        handlerThread.start()
        taskHandler = Handler(handlerThread.looper)
        this.config = config ?: CapConfig.loadDefault(activity)
        Logger.init(this.config)

        // Initialize web view and message handler for it
        initWebView()
        msgHandler = MessageHandler(this, webView, pluginManager)

        // Grab any intent info that our app was launched with
        val intent = context!!.intent
        intentUri = intent.data

        // Register our core plugins
        registerAllPlugins()
        loadWebView()
    }
}