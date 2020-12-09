package com.getcapacitor;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.android.R;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.cordova.MockCordovaInterfaceImpl;
import com.getcapacitor.cordova.MockCordovaWebViewImpl;
import com.getcapacitor.util.HostMask;
import com.getcapacitor.util.PermissionHelper;
import java.io.File;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.json.JSONException;
import org.json.JSONObject;

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
 * <a href="https://github.com/ionic-team/capacitor/blob/HEAD/android/capacitor/src/main/java/com/getcapacitor/BridgeActivity.java">
 *   BridgeActivity.java</a>
 */
public class Bridge {

    private static final String PREFS_NAME = "CapacitorSettings";
    private static final String PERMISSION_PREFS_NAME = "PluginPermStates";
    private static final String BUNDLE_LAST_PLUGIN_ID_KEY = "capacitorLastActivityPluginId";
    private static final String BUNDLE_LAST_PLUGIN_CALL_METHOD_NAME_KEY = "capacitorLastActivityPluginMethod";
    private static final String BUNDLE_PLUGIN_CALL_OPTIONS_SAVED_KEY = "capacitorLastPluginCallOptions";
    private static final String BUNDLE_PLUGIN_CALL_BUNDLE_KEY = "capacitorLastPluginCallBundle";
    private static final String LAST_BINARY_VERSION_CODE = "lastBinaryVersionCode";
    private static final String LAST_BINARY_VERSION_NAME = "lastBinaryVersionName";

    // The name of the directory we use to look for index.html and the rest of our web assets
    public static final String DEFAULT_WEB_ASSET_DIR = "public";
    public static final String CAPACITOR_HTTP_SCHEME = "http";
    public static final String CAPACITOR_HTTPS_SCHEME = "https";
    public static final String CAPACITOR_FILE_START = "/_capacitor_file_";
    public static final String CAPACITOR_CONTENT_START = "/_capacitor_content_";

    // Loaded Capacitor config
    private CapConfig config;

    // A reference to the main activity for the app
    private final AppCompatActivity context;
    private WebViewLocalServer localServer;
    private String localUrl;
    private String appUrl;
    private String appUrlConfig;
    private HostMask appAllowNavigationMask;
    // A reference to the main WebView for the app
    private final WebView webView;
    public final MockCordovaInterfaceImpl cordovaInterface;
    private CordovaWebView cordovaWebView;
    private CordovaPreferences preferences;
    private BridgeWebViewClient webViewClient;
    private App app;

    // Our MessageHandler for sending and receiving data to the WebView
    private final MessageHandler msgHandler;

    // The ThreadHandler for executing plugin calls
    private final HandlerThread handlerThread = new HandlerThread("CapacitorPlugins");

    // Our Handler for posting plugin calls. Created from the ThreadHandler
    private Handler taskHandler = null;

    private final List<Class<? extends Plugin>> initialPlugins;

    // A map of Plugin Id's to PluginHandle's
    private Map<String, PluginHandle> plugins = new HashMap<>();

    // Stored plugin calls that we're keeping around to call again someday
    private Map<String, PluginCall> savedCalls = new HashMap<>();

    // The call IDs of saved plugin calls with associated plugin id for handling permissions
    private Map<String, LinkedList<String>> savedPermissionCallIds = new HashMap<>();

    // Store a plugin that started a new activity, in case we need to resume
    // the app and return that data back
    private PluginCall pluginCallForLastActivity;

    // Any URI that was passed to the app on start
    private Uri intentUri;

    /**
     * Create the Bridge with a reference to the main {@link Activity} for the
     * app, and a reference to the {@link WebView} our app will use.
     * @param context
     * @param webView
     * @deprecated Use {@link Bridge.Builder} to create Bridge instances
     */
    @Deprecated
    public Bridge(
        AppCompatActivity context,
        WebView webView,
        List<Class<? extends Plugin>> initialPlugins,
        MockCordovaInterfaceImpl cordovaInterface,
        PluginManager pluginManager,
        CordovaPreferences preferences,
        JSONObject config
    ) {
        this.app = new App();
        this.context = context;
        this.webView = webView;
        this.webViewClient = new BridgeWebViewClient(this);
        this.initialPlugins = initialPlugins;
        this.cordovaInterface = cordovaInterface;
        this.preferences = preferences;

        // Start our plugin execution threads and handlers
        handlerThread.start();
        taskHandler = new Handler(handlerThread.getLooper());

        this.config = new CapConfig(getActivity().getAssets(), config);
        Logger.init(this.config);

        // Initialize web view and message handler for it
        this.initWebView();
        this.msgHandler = new MessageHandler(this, webView, pluginManager);

        // Grab any intent info that our app was launched with
        Intent intent = context.getIntent();
        this.intentUri = intent.getData();

        // Register our core plugins
        this.registerAllPlugins();

        this.loadWebView();
    }

    public App getApp() {
        return app;
    }

    private void loadWebView() {
        appUrlConfig = this.getServerUrl();
        String[] appAllowNavigationConfig = this.config.getArray("server.allowNavigation");

        ArrayList<String> authorities = new ArrayList<>();
        if (appAllowNavigationConfig != null) {
            authorities.addAll(Arrays.asList(appAllowNavigationConfig));
        }
        this.appAllowNavigationMask = HostMask.Parser.parse(appAllowNavigationConfig);

        String authority = this.getHost();
        authorities.add(authority);

        String scheme = this.getScheme();

        localUrl = scheme + "://" + authority;

        if (appUrlConfig != null) {
            try {
                URL appUrlObject = new URL(appUrlConfig);
                authorities.add(appUrlObject.getAuthority());
            } catch (Exception ex) {}
            localUrl = appUrlConfig;
            appUrl = appUrlConfig;
        } else {
            appUrl = localUrl;
            // custom URL schemes requires path ending with /
            if (!scheme.equals(Bridge.CAPACITOR_HTTP_SCHEME) && !scheme.equals(CAPACITOR_HTTPS_SCHEME)) {
                appUrl += "/";
            }
        }

        final boolean html5mode = this.config.getBoolean("server.html5mode", true);

        // Start the local web server
        localServer = new WebViewLocalServer(context, this, getJSInjector(), authorities, html5mode);
        localServer.hostAssets(DEFAULT_WEB_ASSET_DIR);

        Logger.debug("Loading app at " + appUrl);

        webView.setWebChromeClient(new BridgeWebChromeClient(this));
        webView.setWebViewClient(this.webViewClient);

        if (!isDeployDisabled() && !isNewBinary()) {
            SharedPreferences prefs = getContext()
                .getSharedPreferences(com.getcapacitor.plugin.WebView.WEBVIEW_PREFS_NAME, Activity.MODE_PRIVATE);
            String path = prefs.getString(com.getcapacitor.plugin.WebView.CAP_SERVER_PATH, null);
            if (path != null && !path.isEmpty() && new File(path).exists()) {
                setServerBasePath(path);
            }
        }
        // Get to work
        webView.loadUrl(appUrl);
    }

    public boolean launchIntent(Uri url) {
        /*
         * Give plugins the chance to handle the url
         */
        for (Map.Entry<String, PluginHandle> entry : plugins.entrySet()) {
            Plugin plugin = entry.getValue().getInstance();
            if (plugin != null) {
                Boolean shouldOverrideLoad = plugin.shouldOverrideLoad(url);
                if (shouldOverrideLoad != null) {
                    return shouldOverrideLoad;
                }
            }
        }

        if (!url.toString().contains(appUrl) && !appAllowNavigationMask.matches(url.getHost())) {
            try {
                Intent openIntent = new Intent(Intent.ACTION_VIEW, url);
                getContext().startActivity(openIntent);
            } catch (ActivityNotFoundException e) {
                // TODO - trigger an event
            }
            return true;
        }
        return false;
    }

    private boolean isNewBinary() {
        String versionCode = "";
        String versionName = "";
        SharedPreferences prefs = getContext()
            .getSharedPreferences(com.getcapacitor.plugin.WebView.WEBVIEW_PREFS_NAME, Activity.MODE_PRIVATE);
        String lastVersionCode = prefs.getString(LAST_BINARY_VERSION_CODE, null);
        String lastVersionName = prefs.getString(LAST_BINARY_VERSION_NAME, null);

        try {
            PackageInfo pInfo = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            versionCode = Integer.toString(pInfo.versionCode);
            versionName = pInfo.versionName;
        } catch (Exception ex) {
            Logger.error("Unable to get package info", ex);
        }

        if (!versionCode.equals(lastVersionCode) || !versionName.equals(lastVersionName)) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString(LAST_BINARY_VERSION_CODE, versionCode);
            editor.putString(LAST_BINARY_VERSION_NAME, versionName);
            editor.putString(com.getcapacitor.plugin.WebView.CAP_SERVER_PATH, "");
            editor.apply();
            return true;
        }
        return false;
    }

    public boolean isDeployDisabled() {
        return preferences.getBoolean("DisableDeploy", false);
    }

    public boolean shouldKeepRunning() {
        return preferences.getBoolean("KeepRunning", true);
    }

    public void handleAppUrlLoadError(Exception ex) {
        if (ex instanceof SocketTimeoutException) {
            Logger.error(
                "Unable to load app. Ensure the server is running at " +
                appUrl +
                ", or modify the " +
                "appUrl setting in capacitor.config.json (make sure to npx cap copy after to commit changes).",
                ex
            );
        }
    }

    public boolean isDevMode() {
        return (getActivity().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }

    protected void setCordovaWebView(CordovaWebView cordovaWebView) {
        this.cordovaWebView = cordovaWebView;
    }

    /**
     * Get the Context for the App
     * @return
     */
    public Context getContext() {
        return this.context;
    }

    /**
     * Get the activity for the app
     * @return
     */
    public AppCompatActivity getActivity() {
        return this.context;
    }

    /**
     * Get the core WebView under Capacitor's control
     * @return
     */
    public WebView getWebView() {
        return this.webView;
    }

    /**
     * Get the URI that was used to launch the app (if any)
     * @return
     */
    public Uri getIntentUri() {
        return intentUri;
    }

    /**
     * Get scheme that is used to serve content
     * @return
     */
    public String getScheme() {
        return this.config.getString("server.androidScheme", CAPACITOR_HTTP_SCHEME);
    }

    /**
     * Get host name that is used to serve content
     * @return
     */
    public String getHost() {
        return this.config.getString("server.hostname", "localhost");
    }

    /**
     * Get the server url that is used to serve content
     * @return
     */
    public String getServerUrl() {
        return this.config.getString("server.url");
    }

    public CapConfig getConfig() {
        return this.config;
    }

    public void reset() {
        savedCalls = new HashMap<>();
    }

    /**
     * Initialize the WebView, setting required flags
     */
    private void initWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAppCacheEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        if (this.config.getBoolean("android.allowMixedContent", false)) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        String appendUserAgent = this.config.getString("android.appendUserAgent", this.config.getString("appendUserAgent", null));
        if (appendUserAgent != null) {
            String defaultUserAgent = settings.getUserAgentString();
            settings.setUserAgentString(defaultUserAgent + " " + appendUserAgent);
        }
        String overrideUserAgent = this.config.getString("android.overrideUserAgent", this.config.getString("overrideUserAgent", null));
        if (overrideUserAgent != null) {
            settings.setUserAgentString(overrideUserAgent);
        }

        String backgroundColor = this.config.getString("android.backgroundColor", this.config.getString("backgroundColor", null));
        try {
            if (backgroundColor != null) {
                webView.setBackgroundColor(Color.parseColor(backgroundColor));
            }
        } catch (IllegalArgumentException ex) {
            Logger.debug("WebView background color not applied");
        }
        boolean defaultDebuggable = false;
        if (isDevMode()) {
            defaultDebuggable = true;
        }
        webView.requestFocusFromTouch();
        WebView.setWebContentsDebuggingEnabled(this.config.getBoolean("android.webContentsDebuggingEnabled", defaultDebuggable));
    }

    /**
     * Register our core Plugin APIs
     */
    private void registerAllPlugins() {
        this.registerPlugin(com.getcapacitor.plugin.WebView.class);

        for (Class<? extends Plugin> pluginClass : this.initialPlugins) {
            this.registerPlugin(pluginClass);
        }
    }

    /**
     * Register additional plugins
     * @param pluginClasses the plugins to register
     */
    public void registerPlugins(Class<? extends Plugin>[] pluginClasses) {
        for (Class<? extends Plugin> plugin : pluginClasses) {
            this.registerPlugin(plugin);
        }
    }

    /**
     * Register a plugin class
     * @param pluginClass a class inheriting from Plugin
     */
    public void registerPlugin(Class<? extends Plugin> pluginClass) {
        String pluginName;

        CapacitorPlugin pluginAnnotation = pluginClass.getAnnotation(CapacitorPlugin.class);
        if (pluginAnnotation == null) {
            NativePlugin legacyPluginAnnotation = pluginClass.getAnnotation(NativePlugin.class);

            if (legacyPluginAnnotation == null) {
                Logger.error("Plugin doesn't have the @CapacitorPlugin annotation. Please add it");
                return;
            }

            pluginName = legacyPluginAnnotation.name();
        } else {
            pluginName = pluginAnnotation.name();
        }

        String pluginId = pluginClass.getSimpleName();

        // Use the supplied name as the id if available
        if (!pluginName.equals("")) {
            pluginId = pluginName;
        }

        Logger.debug("Registering plugin: " + pluginId);

        try {
            this.plugins.put(pluginId, new PluginHandle(this, pluginClass));
        } catch (InvalidPluginException ex) {
            Logger.error(
                "NativePlugin " +
                pluginClass.getName() +
                " is invalid. Ensure the @CapacitorPlugin annotation exists on the plugin class and" +
                " the class extends Plugin"
            );
        } catch (PluginLoadException ex) {
            Logger.error("NativePlugin " + pluginClass.getName() + " failed to load", ex);
        }
    }

    public PluginHandle getPlugin(String pluginId) {
        return this.plugins.get(pluginId);
    }

    /**
     * Find the plugin handle that responds to the given request code. This will
     * fire after certain Android OS intent results/permission checks/etc.
     * @param requestCode
     * @return
     */
    public PluginHandle getPluginWithRequestCode(int requestCode) {
        for (PluginHandle handle : this.plugins.values()) {
            int[] requestCodes;
            int permissionRequestCode;

            CapacitorPlugin pluginAnnotation = handle.getPluginAnnotation();
            if (pluginAnnotation == null) {
                // Check for legacy plugin annotation, @NativePlugin
                NativePlugin legacyPluginAnnotation = handle.getLegacyPluginAnnotation();
                if (legacyPluginAnnotation == null) {
                    continue;
                }

                requestCodes = legacyPluginAnnotation.requestCodes();
                permissionRequestCode = legacyPluginAnnotation.permissionRequestCode();
            } else {
                requestCodes = pluginAnnotation.requestCodes();
                permissionRequestCode = pluginAnnotation.permissionRequestCode();
            }

            for (int rc : requestCodes) {
                if (rc == requestCode) {
                    return handle;
                }
            }

            if (permissionRequestCode == requestCode) {
                return handle;
            }
        }
        return null;
    }

    /**
     * Call a method on a plugin.
     * @param pluginId the plugin id to use to lookup the plugin handle
     * @param methodName the name of the method to call
     * @param call the call object to pass to the method
     */
    public void callPluginMethod(String pluginId, final String methodName, final PluginCall call) {
        try {
            final PluginHandle plugin = this.getPlugin(pluginId);

            if (plugin == null) {
                Logger.error("unable to find plugin : " + pluginId);
                call.errorCallback("unable to find plugin : " + pluginId);
                return;
            }

            Logger.verbose(
                "callback: " +
                call.getCallbackId() +
                ", pluginId: " +
                plugin.getId() +
                ", methodName: " +
                methodName +
                ", methodData: " +
                call.getData().toString()
            );

            Runnable currentThreadTask = () -> {
                try {
                    plugin.invoke(methodName, call);

                    if (call.isSaved()) {
                        saveCall(call);
                    }
                } catch (PluginLoadException | InvalidPluginMethodException ex) {
                    Logger.error("Unable to execute plugin method", ex);
                } catch (Exception ex) {
                    Logger.error("Serious error executing plugin", ex);
                    throw new RuntimeException(ex);
                }
            };

            taskHandler.post(currentThreadTask);
        } catch (Exception ex) {
            Logger.error(Logger.tags("callPluginMethod"), "error : " + ex, null);
            call.errorCallback(ex.toString());
        }
    }

    /**
     * Evaluate JavaScript in the web view. This method
     * executes on the main thread automatically.
     * @param js the JS to execute
     * @param callback an optional ValueCallback that will synchronously receive a value
     *                 after calling the JS
     */
    public void eval(final String js, final ValueCallback<String> callback) {
        Handler mainHandler = new Handler(context.getMainLooper());
        mainHandler.post(() -> webView.evaluateJavascript(js, callback));
    }

    public void logToJs(final String message, final String level) {
        eval("window.Capacitor.logJs(\"" + message + "\", \"" + level + "\")", null);
    }

    public void logToJs(final String message) {
        logToJs(message, "log");
    }

    public void triggerJSEvent(final String eventName, final String target) {
        eval("window.Capacitor.triggerEvent(\"" + eventName + "\", \"" + target + "\")", s -> {});
    }

    public void triggerJSEvent(final String eventName, final String target, final String data) {
        eval("window.Capacitor.triggerEvent(\"" + eventName + "\", \"" + target + "\", " + data + ")", s -> {});
    }

    public void triggerWindowJSEvent(final String eventName) {
        this.triggerJSEvent(eventName, "window");
    }

    public void triggerWindowJSEvent(final String eventName, final String data) {
        this.triggerJSEvent(eventName, "window", data);
    }

    public void triggerDocumentJSEvent(final String eventName) {
        this.triggerJSEvent(eventName, "document");
    }

    public void triggerDocumentJSEvent(final String eventName, final String data) {
        this.triggerJSEvent(eventName, "document", data);
    }

    public void execute(Runnable runnable) {
        taskHandler.post(runnable);
    }

    public void executeOnMainThread(Runnable runnable) {
        Handler mainHandler = new Handler(context.getMainLooper());

        mainHandler.post(runnable);
    }

    /**
     * Retain a call between plugin invocations
     * @param call
     */
    public void saveCall(PluginCall call) {
        this.savedCalls.put(call.getCallbackId(), call);
    }

    /**
     * Get a retained plugin call
     * @param callbackId the callbackId to use to lookup the call with
     * @return the stored call
     */
    public PluginCall getSavedCall(String callbackId) {
        if (callbackId == null) {
            return null;
        }

        return this.savedCalls.get(callbackId);
    }

    /**
     * Release a retained call
     * @param call
     */
    public void releaseCall(PluginCall call) {
        this.savedCalls.remove(call.getCallbackId());
    }

    /**
     * Removes the earliest saved call prior to a permissions request for a given plugin and
     * returns it.
     *
     * @return The saved plugin call
     */
    protected PluginCall getPermissionCall(String pluginId) {
        LinkedList<String> permissionCallIds = this.savedPermissionCallIds.get(pluginId);
        String savedCallId = null;
        if (permissionCallIds != null) {
            savedCallId = permissionCallIds.poll();
        }

        return getSavedCall(savedCallId);
    }

    /**
     * Save a call to be retrieved after requesting permissions. Calls are saved in order.
     *
     * @param call The plugin call to save.
     */
    protected void savePermissionCall(PluginCall call) {
        if (call != null) {
            if (!savedPermissionCallIds.containsKey(call.getPluginId())) {
                savedPermissionCallIds.put(call.getPluginId(), new LinkedList<>());
            }

            savedPermissionCallIds.get(call.getPluginId()).add(call.getCallbackId());
            saveCall(call);
        }
    }

    /**
     * Build the JSInjector that will be used to inject JS into files served to the app,
     * to ensure that Capacitor's JS and the JS for all the plugins is loaded each time.
     */
    private JSInjector getJSInjector() {
        try {
            String globalJS = JSExport.getGlobalJS(context, isDevMode());
            String pluginJS = JSExport.getPluginJS(plugins.values());
            String cordovaJS = JSExport.getCordovaJS(context);
            String cordovaPluginsJS = JSExport.getCordovaPluginJS(context);
            String cordovaPluginsFileJS = JSExport.getCordovaPluginsFileJS(context);
            String localUrlJS = "window.WEBVIEW_SERVER_URL = '" + localUrl + "';";

            return new JSInjector(globalJS, pluginJS, cordovaJS, cordovaPluginsJS, cordovaPluginsFileJS, localUrlJS);
        } catch (Exception ex) {
            Logger.error("Unable to export Capacitor JS. App will not function!", ex);
        }
        return null;
    }

    /**
     * Restore any saved bundle state data
     * @param savedInstanceState
     */
    public void restoreInstanceState(Bundle savedInstanceState) {
        String lastPluginId = savedInstanceState.getString(BUNDLE_LAST_PLUGIN_ID_KEY);
        String lastPluginCallMethod = savedInstanceState.getString(BUNDLE_LAST_PLUGIN_CALL_METHOD_NAME_KEY);
        String lastOptionsJson = savedInstanceState.getString(BUNDLE_PLUGIN_CALL_OPTIONS_SAVED_KEY);

        if (lastPluginId != null) {
            // If we have JSON blob saved, create a new plugin call with the original options
            if (lastOptionsJson != null) {
                try {
                    JSObject options = new JSObject(lastOptionsJson);

                    pluginCallForLastActivity =
                        new PluginCall(msgHandler, lastPluginId, PluginCall.CALLBACK_ID_DANGLING, lastPluginCallMethod, options);
                } catch (JSONException ex) {
                    Logger.error("Unable to restore plugin call, unable to parse persisted JSON object", ex);
                }
            }

            // Let the plugin restore any state it needs
            Bundle bundleData = savedInstanceState.getBundle(BUNDLE_PLUGIN_CALL_BUNDLE_KEY);
            PluginHandle lastPlugin = getPlugin(lastPluginId);
            if (lastPlugin != null) {
                lastPlugin.getInstance().restoreState(bundleData);
            }
        }
    }

    public void saveInstanceState(Bundle outState) {
        Logger.debug("Saving instance state!");

        // If there was a last PluginCall for a started activity, we need to
        // persist it so we can load it again in case our app gets terminated
        if (pluginCallForLastActivity != null) {
            PluginCall call = pluginCallForLastActivity;
            PluginHandle handle = getPlugin(call.getPluginId());

            if (handle != null) {
                outState.putString(BUNDLE_LAST_PLUGIN_ID_KEY, call.getPluginId());
                outState.putString(BUNDLE_LAST_PLUGIN_CALL_METHOD_NAME_KEY, call.getMethodName());
                outState.putString(BUNDLE_PLUGIN_CALL_OPTIONS_SAVED_KEY, call.getData().toString());
                outState.putBundle(BUNDLE_PLUGIN_CALL_BUNDLE_KEY, handle.getInstance().saveInstanceState());
            }
        }
    }

    public void startActivityForPluginWithResult(PluginCall call, Intent intent, int requestCode) {
        Logger.debug("Starting activity for result");

        pluginCallForLastActivity = call;

        getActivity().startActivityForResult(intent, requestCode);
    }

    /**
     * Handle a request permission result by finding the that requested
     * the permission and calling their permission handler
     * @param requestCode the code that was requested
     * @param permissions the permissions requested
     * @param grantResults the set of granted/denied permissions
     */
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        PluginHandle plugin = getPluginWithRequestCode(requestCode);

        if (plugin == null) {
            Logger.debug("Unable to find a Capacitor plugin to handle permission requestCode, trying Cordova plugins " + requestCode);
            try {
                cordovaInterface.onRequestPermissionResult(requestCode, permissions, grantResults);
            } catch (JSONException e) {
                Logger.debug("Error on Cordova plugin permissions request " + e.getMessage());
            }
            return;
        }

        if (plugin.getPluginAnnotation() != null) {
            // Handle for @CapacitorPlugin permissions
            PluginCall savedPermissionCall = getPermissionCall(plugin.getId());
            if (savedPermissionCall != null) {
                if (validatePermissions(plugin.getInstance(), savedPermissionCall, permissions, grantResults)) {
                    // handle request permissions call
                    if (savedPermissionCall.getMethodName().equals("requestPermissions")) {
                        savedPermissionCall.resolve(getPermissionStates(plugin.getInstance()));
                    } else {
                        // handle permission requests by other methods on the plugin
                        plugin.getInstance().onRequestPermissionsResult(savedPermissionCall, requestCode, permissions, grantResults);

                        if (!savedPermissionCall.isReleased() && !savedPermissionCall.isSaved()) {
                            savedPermissionCall.release(this);
                        }
                    }
                }
            }
        } else {
            // Call deprecated method if using deprecated NativePlugin annotation
            plugin.getInstance().handleRequestPermissionsResult(requestCode, permissions, grantResults);
        }
    }

    /**
     * Saves permission states and rejects if permissions were not correctly defined in
     * the AndroidManifest.xml file.
     *
     * @param plugin
     * @param savedCall
     * @param permissions
     * @param grantResults
     * @return true if permissions were saved and defined correctly, false if not
     */
    protected boolean validatePermissions(Plugin plugin, PluginCall savedCall, String[] permissions, int[] grantResults) {
        SharedPreferences prefs = getContext().getSharedPreferences(PERMISSION_PREFS_NAME, Activity.MODE_PRIVATE);

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

        if (!plugin.hasDefinedPermissions(permissions)) {
            StringBuilder builder = new StringBuilder();
            builder.append("Missing the following permissions in AndroidManifest.xml:\n");
            String[] missing = PermissionHelper.getUndefinedPermissions(getContext(), permissions);
            for (String perm : missing) {
                builder.append(perm + "\n");
            }
            savedCall.reject(builder.toString());
            return false;
        }

        return true;
    }

    /**
     * Helper to check all permissions and see the current states of each permission.
     *
     * @since 3.0.0
     * @return A mapping of permissions to the associated granted status.
     */
    protected JSObject getPermissionStates(Plugin plugin) {
        JSObject permissionsResults = new JSObject();
        CapacitorPlugin annotation = plugin.getPluginHandle().getPluginAnnotation();
        for (Permission perm : annotation.permissions()) {
            // If a permission is defined with no permission constants, return "granted" for it.
            // Otherwise, get its true state.
            if (perm.strings().length == 0 || (perm.strings().length == 1 && perm.strings()[0].isEmpty())) {
                String key = perm.alias();
                if (!key.isEmpty()) {
                    String existingResult = permissionsResults.getString(key);

                    // auto set permission state to granted if the alias is empty.
                    if (existingResult == null) {
                        permissionsResults.put(key, "granted");
                    }
                }
            } else {
                for (String permString : perm.strings()) {
                    String key = perm.alias().isEmpty() ? permString : perm.alias();
                    String permissionStatus = plugin.hasPermission(permString) ? "granted" : "prompt";

                    // Check if there is a cached permission state for the "Never ask again" state
                    if (permissionStatus.equals("prompt")) {
                        SharedPreferences prefs = getContext().getSharedPreferences(PERMISSION_PREFS_NAME, Activity.MODE_PRIVATE);
                        String state = prefs.getString(permString, null);

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
            }
        }

        return permissionsResults;
    }

    /**
     * Handle an activity result and pass it to a plugin that has indicated it wants to
     * handle the result.
     * @param requestCode
     * @param resultCode
     * @param data
     */
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        PluginHandle plugin = getPluginWithRequestCode(requestCode);

        if (plugin == null || plugin.getInstance() == null) {
            Logger.debug("Unable to find a Capacitor plugin to handle requestCode, trying Cordova plugins " + requestCode);
            cordovaInterface.onActivityResult(requestCode, resultCode, data);
            return;
        }

        // deprecated, to be removed
        PluginCall lastCall = plugin.getInstance().getSavedCall();

        // If we don't have a saved last call (because our app was killed and restarted, for example),
        // Then we should see if we have any saved plugin call information and generate a new,
        // "dangling" plugin call (a plugin call that doesn't have a corresponding web callback)
        // and then send that to the plugin
        if (lastCall == null && pluginCallForLastActivity != null) {
            plugin.getInstance().saveCall(pluginCallForLastActivity);
        }

        CapacitorPlugin pluginAnnotation = plugin.getPluginClass().getAnnotation(CapacitorPlugin.class);
        if (pluginAnnotation != null) {
            // Use new callback with new @CapacitorPlugin plugins
            plugin.getInstance().handleOnActivityResult(pluginCallForLastActivity, requestCode, resultCode, data);
        } else {
            plugin.getInstance().handleOnActivityResult(requestCode, resultCode, data);
        }

        // Clear the plugin call we may have re-hydrated on app launch
        pluginCallForLastActivity = null;
    }

    /**
     * Handle an onNewIntent lifecycle event and notify the plugins
     * @param intent
     */
    public void onNewIntent(Intent intent) {
        for (PluginHandle plugin : plugins.values()) {
            plugin.getInstance().handleOnNewIntent(intent);
        }

        if (cordovaWebView != null) {
            cordovaWebView.onNewIntent(intent);
        }
    }

    /**
     * Handle onRestart lifecycle event and notify the plugins
     */
    public void onRestart() {
        for (PluginHandle plugin : plugins.values()) {
            plugin.getInstance().handleOnRestart();
        }
    }

    /**
     * Handle onStart lifecycle event and notify the plugins
     */
    public void onStart() {
        for (PluginHandle plugin : plugins.values()) {
            plugin.getInstance().handleOnStart();
        }

        if (cordovaWebView != null) {
            cordovaWebView.handleStart();
        }
    }

    /**
     * Handle onResume lifecycle event and notify the plugins
     */
    public void onResume() {
        for (PluginHandle plugin : plugins.values()) {
            plugin.getInstance().handleOnResume();
        }

        if (cordovaWebView != null) {
            cordovaWebView.handleResume(this.shouldKeepRunning());
        }
    }

    /**
     * Handle onPause lifecycle event and notify the plugins
     */
    public void onPause() {
        for (PluginHandle plugin : plugins.values()) {
            plugin.getInstance().handleOnPause();
        }

        if (cordovaWebView != null) {
            boolean keepRunning = this.shouldKeepRunning() || cordovaInterface.getActivityResultCallback() != null;
            cordovaWebView.handlePause(keepRunning);
        }
    }

    /**
     * Handle onStop lifecycle event and notify the plugins
     */
    public void onStop() {
        for (PluginHandle plugin : plugins.values()) {
            plugin.getInstance().handleOnStop();
        }

        if (cordovaWebView != null) {
            cordovaWebView.handleStop();
        }
    }

    /**
     * Handle onDestroy lifecycle event and notify the plugins
     */
    public void onDestroy() {
        for (PluginHandle plugin : plugins.values()) {
            plugin.getInstance().handleOnDestroy();
        }

        handlerThread.quitSafely();

        if (cordovaWebView != null) {
            cordovaWebView.handleDestroy();
        }
    }

    /**
     * Handle onDetachedFromWindow lifecycle event
     */
    public void onDetachedFromWindow() {
        webView.removeAllViews();
        webView.destroy();
    }

    public void onBackPressed() {
        // If there are listeners, don't do the default action, as this means the user
        // wants to override the back button
        if (app.hasBackButtonListeners()) {
            app.fireBackButton();
            triggerJSEvent("backbutton", "document");
        } else {
            if (webView.canGoBack()) {
                webView.goBack();
            }
        }
    }

    public String getServerBasePath() {
        return this.localServer.getBasePath();
    }

    /**
     * Tell the local server to load files from the given
     * file path instead of the assets path.
     * @param path
     */
    public void setServerBasePath(String path) {
        localServer.hostFiles(path);
        webView.post(() -> webView.loadUrl(appUrl));
    }

    /**
     * Tell the local server to load files from the given
     * asset path.
     * @param path
     */
    public void setServerAssetPath(String path) {
        localServer.hostAssets(path);
        webView.post(() -> webView.loadUrl(appUrl));
    }

    public String getLocalUrl() {
        return localUrl;
    }

    public WebViewLocalServer getLocalServer() {
        return localServer;
    }

    public HostMask getAppAllowNavigationMask() {
        return appAllowNavigationMask;
    }

    public BridgeWebViewClient getWebViewClient() {
        return this.webViewClient;
    }

    public void setWebViewClient(BridgeWebViewClient client) {
        this.webViewClient = client;
    }

    public static class Builder {

        private Bundle instanceState = null;
        private JSONObject config = new JSONObject();
        private List<Class<? extends Plugin>> plugins = new ArrayList<>();
        private AppCompatActivity activity = null;
        private Context context = null;
        private WebView webView = null;

        protected Builder setActivity(AppCompatActivity activity) {
            this.activity = activity;
            this.context = activity.getApplicationContext();
            this.webView = activity.findViewById(R.id.webview);
            return this;
        }

        public Builder setInstanceState(Bundle instanceState) {
            this.instanceState = instanceState;
            return this;
        }

        public Builder setConfig(JSONObject config) {
            this.config = config;
            return this;
        }

        public Builder setPlugins(List<Class<? extends Plugin>> plugins) {
            this.plugins = plugins;
            return this;
        }

        public Builder addPlugin(Class<? extends Plugin> plugin) {
            this.plugins.add(plugin);
            return this;
        }

        public Builder addPlugins(List<Class<? extends Plugin>> plugins) {
            for (Class<? extends Plugin> cls : plugins) {
                this.addPlugin(cls);
            }

            return this;
        }

        public Bridge create() {
            // Cordova initialization
            ConfigXmlParser parser = new ConfigXmlParser();
            parser.parse(context);
            CordovaPreferences preferences = parser.getPreferences();
            preferences.setPreferencesBundle(activity.getIntent().getExtras());
            List<PluginEntry> pluginEntries = parser.getPluginEntries();
            MockCordovaInterfaceImpl cordovaInterface = new MockCordovaInterfaceImpl(activity);
            if (instanceState != null) {
                cordovaInterface.restoreInstanceState(instanceState);
            }
            MockCordovaWebViewImpl mockWebView = new MockCordovaWebViewImpl(context);
            mockWebView.init(cordovaInterface, pluginEntries, preferences, webView);
            PluginManager pluginManager = mockWebView.getPluginManager();
            cordovaInterface.onCordovaInit(pluginManager);

            // Bridge initialization
            Bridge bridge = new Bridge(activity, webView, plugins, cordovaInterface, pluginManager, preferences, config);
            bridge.setCordovaWebView(mockWebView);

            if (instanceState != null) {
                bridge.restoreInstanceState(instanceState);
            }

            return bridge;
        }
    }
}
