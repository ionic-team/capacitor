package com.getcapacitor;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.ValueCallback;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContract;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.pm.PackageInfoCompat;
import androidx.fragment.app.Fragment;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.android.R;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.cordova.MockCordovaInterfaceImpl;
import com.getcapacitor.cordova.MockCordovaWebViewImpl;
import com.getcapacitor.util.HostMask;
import com.getcapacitor.util.InternalUtils;
import com.getcapacitor.util.PermissionHelper;
import com.getcapacitor.util.WebColor;
import java.io.File;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.json.JSONException;

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

    private static final String PERMISSION_PREFS_NAME = "PluginPermStates";
    private static final String BUNDLE_LAST_PLUGIN_ID_KEY = "capacitorLastActivityPluginId";
    private static final String BUNDLE_LAST_PLUGIN_CALL_METHOD_NAME_KEY = "capacitorLastActivityPluginMethod";
    private static final String BUNDLE_PLUGIN_CALL_OPTIONS_SAVED_KEY = "capacitorLastPluginCallOptions";
    private static final String BUNDLE_PLUGIN_CALL_BUNDLE_KEY = "capacitorLastPluginCallBundle";
    private static final String LAST_BINARY_VERSION_CODE = "lastBinaryVersionCode";
    private static final String LAST_BINARY_VERSION_NAME = "lastBinaryVersionName";
    private static final String MINIMUM_ANDROID_WEBVIEW_ERROR = "System WebView is not supported";

    // The name of the directory we use to look for index.html and the rest of our web assets
    public static final String DEFAULT_WEB_ASSET_DIR = "public";
    public static final String CAPACITOR_HTTP_SCHEME = "http";
    public static final String CAPACITOR_HTTPS_SCHEME = "https";
    public static final String CAPACITOR_FILE_START = "/_capacitor_file_";
    public static final String CAPACITOR_CONTENT_START = "/_capacitor_content_";
    public static final String CAPACITOR_HTTP_INTERCEPTOR_START = "/_capacitor_http_interceptor_";

    /** @deprecated CAPACITOR_HTTPS_INTERCEPTOR_START is no longer required. All proxied requests are handled via CAPACITOR_HTTP_INTERCEPTOR_START instead */
    @Deprecated
    public static final String CAPACITOR_HTTPS_INTERCEPTOR_START = "/_capacitor_https_interceptor_";

    public static final String CAPACITOR_HTTP_INTERCEPTOR_URL_PARAM = "u";

    public static final int DEFAULT_ANDROID_WEBVIEW_VERSION = 60;
    public static final int MINIMUM_ANDROID_WEBVIEW_VERSION = 55;
    public static final int DEFAULT_HUAWEI_WEBVIEW_VERSION = 10;
    public static final int MINIMUM_HUAWEI_WEBVIEW_VERSION = 10;

    // Loaded Capacitor config
    private CapConfig config;

    // A reference to the main activity for the app
    private final AppCompatActivity context;
    // A reference to the containing Fragment if used
    private final Fragment fragment;
    private WebViewLocalServer localServer;
    private String localUrl;
    private String appUrl;
    private String appUrlConfig;
    private HostMask appAllowNavigationMask;
    private Set<String> allowedOriginRules = new HashSet<String>();
    private ArrayList<String> authorities = new ArrayList<>();
    private ArrayList<String> miscJSFileInjections = new ArrayList<String>();
    private Boolean canInjectJS = true;
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

    private final List<Plugin> pluginInstances;

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

    // A list of listeners that trigger when webView events occur
    private List<WebViewListener> webViewListeners = new ArrayList<>();

    // An interface to manipulate route resolving
    private RouteProcessor routeProcessor;

    // A pre-determined path to load the bridge
    private ServerPath serverPath;

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
        CapConfig config
    ) {
        this(context, null, null, webView, initialPlugins, new ArrayList<>(), cordovaInterface, pluginManager, preferences, config);
    }

    private Bridge(
        AppCompatActivity context,
        ServerPath serverPath,
        Fragment fragment,
        WebView webView,
        List<Class<? extends Plugin>> initialPlugins,
        List<Plugin> pluginInstances,
        MockCordovaInterfaceImpl cordovaInterface,
        PluginManager pluginManager,
        CordovaPreferences preferences,
        CapConfig config
    ) {
        this.app = new App();
        this.serverPath = serverPath;
        this.context = context;
        this.fragment = fragment;
        this.webView = webView;
        this.webViewClient = new BridgeWebViewClient(this);
        this.initialPlugins = initialPlugins;
        this.pluginInstances = pluginInstances;
        this.cordovaInterface = cordovaInterface;
        this.preferences = preferences;

        // Start our plugin execution threads and handlers
        handlerThread.start();
        taskHandler = new Handler(handlerThread.getLooper());

        this.config = config != null ? config : CapConfig.loadDefault(getActivity());
        Logger.init(this.config);

        // Initialize web view and message handler for it
        this.initWebView();
        this.setAllowedOriginRules();
        this.msgHandler = new MessageHandler(this, webView, pluginManager);

        // Grab any intent info that our app was launched with
        Intent intent = context.getIntent();
        this.intentUri = intent.getData();
        // Register our core plugins
        this.registerAllPlugins();

        this.loadWebView();
    }

    private void setAllowedOriginRules() {
        String[] appAllowNavigationConfig = this.config.getAllowNavigation();
        String authority = this.getHost();
        String scheme = this.getScheme();
        allowedOriginRules.add(scheme + "://" + authority);
        if (this.getServerUrl() != null) {
            allowedOriginRules.add(this.getServerUrl());
        }
        if (appAllowNavigationConfig != null) {
            for (String allowNavigation : appAllowNavigationConfig) {
                if (!allowNavigation.startsWith("http")) {
                    allowedOriginRules.add("https://" + allowNavigation);
                } else {
                    allowedOriginRules.add(allowNavigation);
                }
            }
            authorities.addAll(Arrays.asList(appAllowNavigationConfig));
        }
        this.appAllowNavigationMask = HostMask.Parser.parse(appAllowNavigationConfig);
    }

    public App getApp() {
        return app;
    }

    private void loadWebView() {
        final boolean html5mode = this.config.isHTML5Mode();

        // Start the local web server
        JSInjector injector = getJSInjector();
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            String allowedOrigin = Uri.parse(appUrl).buildUpon().path(null).fragment(null).clearQuery().build().toString();
            try {
                WebViewCompat.addDocumentStartJavaScript(webView, injector.getScriptString(), Collections.singleton(allowedOrigin));
                injector = null;
            } catch (IllegalArgumentException ex) {
                Logger.warn("Invalid url, using fallback");
            }
        }
        localServer = new WebViewLocalServer(context, this, injector, authorities, html5mode);
        localServer.hostAssets(DEFAULT_WEB_ASSET_DIR);

        Logger.debug("Loading app at " + appUrl);

        webView.setWebChromeClient(new BridgeWebChromeClient(this));
        webView.setWebViewClient(this.webViewClient);

        if (Build.VERSION.SDK_INT >= 24 && config.isResolveServiceWorkerRequests()) {
            ServiceWorkerController swController = ServiceWorkerController.getInstance();
            swController.setServiceWorkerClient(
                new ServiceWorkerClient() {
                    @Override
                    public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                        return getLocalServer().shouldInterceptRequest(request);
                    }
                }
            );
        }

        if (!isDeployDisabled() && !isNewBinary()) {
            SharedPreferences prefs = getContext()
                .getSharedPreferences(com.getcapacitor.plugin.WebView.WEBVIEW_PREFS_NAME, Activity.MODE_PRIVATE);
            String path = prefs.getString(com.getcapacitor.plugin.WebView.CAP_SERVER_PATH, null);
            if (path != null && !path.isEmpty() && new File(path).exists()) {
                setServerBasePath(path);
            }
        }
        if (!this.isMinimumWebViewInstalled()) {
            String errorUrl = this.getErrorUrl();
            if (errorUrl != null) {
                webView.loadUrl(errorUrl);
                return;
            } else {
                Logger.error(MINIMUM_ANDROID_WEBVIEW_ERROR);
            }
        }

        // If serverPath configured, start server based on provided path
        if (serverPath != null) {
            if (serverPath.getType() == ServerPath.PathType.ASSET_PATH) {
                setServerAssetPath(serverPath.getPath());
            } else {
                setServerBasePath(serverPath.getPath());
            }
        } else {
            // Get to work
            webView.loadUrl(appUrl);
        }
    }

    @SuppressLint("WebViewApiAvailability")
    public boolean isMinimumWebViewInstalled() {
        PackageManager pm = getContext().getPackageManager();

        // Check getCurrentWebViewPackage() directly if above Android 8
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            PackageInfo info = WebView.getCurrentWebViewPackage();
            Pattern pattern = Pattern.compile("(\\d+)");
            Matcher matcher = pattern.matcher(info.versionName);
            if (matcher.find()) {
                String majorVersionStr = matcher.group(0);
                int majorVersion = Integer.parseInt(majorVersionStr);
                if (info.packageName.equals("com.huawei.webview")) {
                    return majorVersion >= config.getMinHuaweiWebViewVersion();
                }
                return majorVersion >= config.getMinWebViewVersion();
            } else {
                return false;
            }
        }

        // Otherwise manually check WebView versions
        try {
            String webViewPackage = "com.google.android.webview";
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                webViewPackage = "com.android.chrome";
            }
            PackageInfo info = InternalUtils.getPackageInfo(pm, webViewPackage);
            String majorVersionStr = info.versionName.split("\\.")[0];
            int majorVersion = Integer.parseInt(majorVersionStr);
            return majorVersion >= config.getMinWebViewVersion();
        } catch (Exception ex) {
            Logger.warn("Unable to get package info for 'com.google.android.webview'" + ex.toString());
        }

        try {
            PackageInfo info = InternalUtils.getPackageInfo(pm, "com.android.webview");
            String majorVersionStr = info.versionName.split("\\.")[0];
            int majorVersion = Integer.parseInt(majorVersionStr);
            return majorVersion >= config.getMinWebViewVersion();
        } catch (Exception ex) {
            Logger.warn("Unable to get package info for 'com.android.webview'" + ex.toString());
        }

        final int amazonFireMajorWebViewVersion = extractWebViewMajorVersion(pm, "com.amazon.webview.chromium");
        if (amazonFireMajorWebViewVersion >= config.getMinWebViewVersion()) {
            return true;
        }

        // Could not detect any webview, return false
        return false;
    }

    private int extractWebViewMajorVersion(final PackageManager pm, final String webViewPackageName) {
        try {
            final PackageInfo info = InternalUtils.getPackageInfo(pm, webViewPackageName);
            final String majorVersionStr = info.versionName.split("\\.")[0];
            final int majorVersion = Integer.parseInt(majorVersionStr);
            return majorVersion;
        } catch (Exception ex) {
            Logger.warn(String.format("Unable to get package info for '%s' with err '%s'", webViewPackageName, ex));
        }
        return 0;
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

        if (url.getScheme().equals("data") || url.getScheme().equals("blob")) {
            return false;
        }

        Uri appUri = Uri.parse(appUrl);
        if (
            !(appUri.getHost().equals(url.getHost()) && url.getScheme().equals(appUri.getScheme())) &&
            !appAllowNavigationMask.matches(url.getHost())
        ) {
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
            PackageManager pm = getContext().getPackageManager();
            PackageInfo pInfo = InternalUtils.getPackageInfo(pm, getContext().getPackageName());
            versionCode = Integer.toString((int) PackageInfoCompat.getLongVersionCode(pInfo));
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
     * Get the fragment for the app, if applicable. This will likely be null unless Capacitor
     * is being used embedded in a Native Android app.
     *
     * @return The fragment containing the Capacitor WebView.
     */
    public Fragment getFragment() {
        return this.fragment;
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
        return this.config.getAndroidScheme();
    }

    /**
     * Get host name that is used to serve content
     * @return
     */
    public String getHost() {
        return this.config.getHostname();
    }

    /**
     * Get the server url that is used to serve content
     * @return
     */
    public String getServerUrl() {
        return this.config.getServerUrl();
    }

    public String getErrorUrl() {
        String errorPath = this.config.getErrorPath();

        if (errorPath != null && !errorPath.trim().isEmpty()) {
            String authority = this.getHost();
            String scheme = this.getScheme();

            String localUrl = scheme + "://" + authority;

            return localUrl + "/" + errorPath;
        }

        return null;
    }

    public String getAppUrl() {
        return appUrl;
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
    @SuppressLint("SetJavaScriptEnabled")
    private void initWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        if (this.config.isMixedContentAllowed()) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        String appendUserAgent = this.config.getAppendedUserAgentString();
        if (appendUserAgent != null) {
            String defaultUserAgent = settings.getUserAgentString();
            settings.setUserAgentString(defaultUserAgent + " " + appendUserAgent);
        }
        String overrideUserAgent = this.config.getOverriddenUserAgentString();
        if (overrideUserAgent != null) {
            settings.setUserAgentString(overrideUserAgent);
        }

        String backgroundColor = this.config.getBackgroundColor();
        try {
            if (backgroundColor != null) {
                webView.setBackgroundColor(WebColor.parseColor(backgroundColor));
            }
        } catch (IllegalArgumentException ex) {
            Logger.debug("WebView background color not applied");
        }

        settings.setDisplayZoomControls(false);
        settings.setBuiltInZoomControls(this.config.isZoomableWebView());

        if (config.isInitialFocus()) {
            webView.requestFocusFromTouch();
        }

        WebView.setWebContentsDebuggingEnabled(this.config.isWebContentsDebuggingEnabled());

        appUrlConfig = this.getServerUrl();
        String authority = this.getHost();
        authorities.add(authority);
        String scheme = this.getScheme();

        localUrl = scheme + "://" + authority;

        if (appUrlConfig != null) {
            try {
                URL appUrlObject = new URL(appUrlConfig);
                authorities.add(appUrlObject.getAuthority());
            } catch (Exception ex) {
                Logger.error("Provided server url is invalid: " + ex.getMessage());
                return;
            }
            localUrl = appUrlConfig;
            appUrl = appUrlConfig;
        } else {
            appUrl = localUrl;
            // custom URL schemes requires path ending with /
            if (!scheme.equals(Bridge.CAPACITOR_HTTP_SCHEME) && !scheme.equals(CAPACITOR_HTTPS_SCHEME)) {
                appUrl += "/";
            }
        }

        String appUrlPath = this.config.getStartPath();
        if (appUrlPath != null && !appUrlPath.trim().isEmpty()) {
            appUrl += appUrlPath;
        }
    }

    /**
     * Register our core Plugin APIs
     */
    private void registerAllPlugins() {
        this.registerPlugin(com.getcapacitor.plugin.CapacitorCookies.class);
        this.registerPlugin(com.getcapacitor.plugin.WebView.class);
        this.registerPlugin(com.getcapacitor.plugin.CapacitorHttp.class);

        for (Class<? extends Plugin> pluginClass : this.initialPlugins) {
            this.registerPlugin(pluginClass);
        }

        for (Plugin plugin : pluginInstances) {
            registerPluginInstance(plugin);
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

    public void registerPluginInstances(Plugin[] pluginInstances) {
        for (Plugin plugin : pluginInstances) {
            this.registerPluginInstance(plugin);
        }
    }

    @SuppressWarnings("deprecation")
    private String getLegacyPluginName(Class<? extends Plugin> pluginClass) {
        NativePlugin legacyPluginAnnotation = pluginClass.getAnnotation(NativePlugin.class);
        if (legacyPluginAnnotation == null) {
            Logger.error("Plugin doesn't have the @CapacitorPlugin annotation. Please add it");
            return null;
        }

        return legacyPluginAnnotation.name();
    }

    /**
     * Register a plugin class
     * @param pluginClass a class inheriting from Plugin
     */
    public void registerPlugin(Class<? extends Plugin> pluginClass) {
        String pluginId = pluginId(pluginClass);
        if (pluginId == null) return;

        try {
            this.plugins.put(pluginId, new PluginHandle(this, pluginClass));
        } catch (InvalidPluginException ex) {
            logInvalidPluginException(pluginClass);
        } catch (PluginLoadException ex) {
            logPluginLoadException(pluginClass, ex);
        }
    }

    public void registerPluginInstance(Plugin plugin) {
        Class<? extends Plugin> clazz = plugin.getClass();
        String pluginId = pluginId(clazz);
        if (pluginId == null) return;

        try {
            this.plugins.put(pluginId, new PluginHandle(this, plugin));
        } catch (InvalidPluginException ex) {
            logInvalidPluginException(clazz);
        }
    }

    private String pluginId(Class<? extends Plugin> clazz) {
        String pluginName = pluginName(clazz);
        String pluginId = clazz.getSimpleName();
        if (pluginName == null) return null;

        if (!pluginName.equals("")) {
            pluginId = pluginName;
        }
        Logger.debug("Registering plugin instance: " + pluginId);
        return pluginId;
    }

    private String pluginName(Class<? extends Plugin> clazz) {
        String pluginName;
        CapacitorPlugin pluginAnnotation = clazz.getAnnotation(CapacitorPlugin.class);
        if (pluginAnnotation == null) {
            pluginName = this.getLegacyPluginName(clazz);
        } else {
            pluginName = pluginAnnotation.name();
        }

        return pluginName;
    }

    private void logInvalidPluginException(Class<? extends Plugin> clazz) {
        Logger.error(
            "NativePlugin " +
            clazz.getName() +
            " is invalid. Ensure the @CapacitorPlugin annotation exists on the plugin class and" +
            " the class extends Plugin"
        );
    }

    private void logPluginLoadException(Class<? extends Plugin> clazz, Exception ex) {
        Logger.error("NativePlugin " + clazz.getName() + " failed to load", ex);
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
    @Deprecated
    @SuppressWarnings("deprecation")
    public PluginHandle getPluginWithRequestCode(int requestCode) {
        for (PluginHandle handle : this.plugins.values()) {
            int[] requestCodes;

            CapacitorPlugin pluginAnnotation = handle.getPluginAnnotation();
            if (pluginAnnotation == null) {
                // Check for legacy plugin annotation, @NativePlugin
                NativePlugin legacyPluginAnnotation = handle.getLegacyPluginAnnotation();
                if (legacyPluginAnnotation == null) {
                    continue;
                }

                if (legacyPluginAnnotation.permissionRequestCode() == requestCode) {
                    return handle;
                }

                requestCodes = legacyPluginAnnotation.requestCodes();

                for (int rc : requestCodes) {
                    if (rc == requestCode) {
                        return handle;
                    }
                }
            } else {
                requestCodes = pluginAnnotation.requestCodes();

                for (int rc : requestCodes) {
                    if (rc == requestCode) {
                        return handle;
                    }
                }
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

            if (Logger.shouldLog()) {
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
            }

            Runnable currentThreadTask = () -> {
                try {
                    plugin.invoke(methodName, call);

                    if (call.isKeptAlive()) {
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

    PluginCall getPluginCallForLastActivity() {
        PluginCall pluginCallForLastActivity = this.pluginCallForLastActivity;
        this.pluginCallForLastActivity = null;
        return pluginCallForLastActivity;
    }

    void setPluginCallForLastActivity(PluginCall pluginCallForLastActivity) {
        this.pluginCallForLastActivity = pluginCallForLastActivity;
    }

    /**
     * Release a retained call
     * @param call a call to release
     */
    public void releaseCall(PluginCall call) {
        releaseCall(call.getCallbackId());
    }

    /**
     * Release a retained call by its ID
     * @param callbackId an ID of a callback to release
     */
    public void releaseCall(String callbackId) {
        this.savedCalls.remove(callbackId);
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
     * Register an Activity Result Launcher to the containing Fragment or Activity.
     *
     * @param contract A contract specifying that an activity can be called with an input of
     *                 type I and produce an output of type O.
     * @param callback The callback run on Activity Result.
     * @return A registered Activity Result Launcher.
     */
    public <I, O> ActivityResultLauncher<I> registerForActivityResult(
        @NonNull final ActivityResultContract<I, O> contract,
        @NonNull final ActivityResultCallback<O> callback
    ) {
        if (fragment != null) {
            return fragment.registerForActivityResult(contract, callback);
        } else {
            return context.registerForActivityResult(contract, callback);
        }
    }

    /**
     * Build the JSInjector that will be used to inject JS into files served to the app,
     * to ensure that Capacitor's JS and the JS for all the plugins is loaded each time.
     */
    private JSInjector getJSInjector() {
        try {
            String globalJS = JSExport.getGlobalJS(context, config.isLoggingEnabled(), isDevMode());
            String bridgeJS = JSExport.getBridgeJS(context);
            String pluginJS = JSExport.getPluginJS(plugins.values());
            String cordovaJS = JSExport.getCordovaJS(context);
            String cordovaPluginsJS = JSExport.getCordovaPluginJS(context);
            String cordovaPluginsFileJS = JSExport.getCordovaPluginsFileJS(context);
            String localUrlJS = "window.WEBVIEW_SERVER_URL = '" + localUrl + "';";
            String miscJS = JSExport.getMiscFileJS(miscJSFileInjections, context);

            miscJSFileInjections = new ArrayList<>();
            canInjectJS = false;

            return new JSInjector(globalJS, bridgeJS, pluginJS, cordovaJS, cordovaPluginsJS, cordovaPluginsFileJS, localUrlJS, miscJS);
        } catch (Exception ex) {
            Logger.error("Unable to export Capacitor JS. App will not function!", ex);
        }
        return null;
    }

    /**
     * Inject JavaScript from an external file before the WebView loads.
     * @param path relative to public folder
     */
    public void injectScriptBeforeLoad(String path) {
        if (canInjectJS) {
            miscJSFileInjections.add(path);
        }
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

                    pluginCallForLastActivity = new PluginCall(
                        msgHandler,
                        lastPluginId,
                        PluginCall.CALLBACK_ID_DANGLING,
                        lastPluginCallMethod,
                        options
                    );
                } catch (JSONException ex) {
                    Logger.error("Unable to restore plugin call, unable to parse persisted JSON object", ex);
                }
            }

            // Let the plugin restore any state it needs
            Bundle bundleData = savedInstanceState.getBundle(BUNDLE_PLUGIN_CALL_BUNDLE_KEY);
            PluginHandle lastPlugin = getPlugin(lastPluginId);
            if (bundleData != null && lastPlugin != null) {
                lastPlugin.getInstance().restoreState(bundleData);
            } else {
                Logger.error("Unable to restore last plugin call");
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
                Bundle bundle = handle.getInstance().saveInstanceState();
                if (bundle != null) {
                    outState.putString(BUNDLE_LAST_PLUGIN_ID_KEY, call.getPluginId());
                    outState.putString(BUNDLE_LAST_PLUGIN_CALL_METHOD_NAME_KEY, call.getMethodName());
                    outState.putString(BUNDLE_PLUGIN_CALL_OPTIONS_SAVED_KEY, call.getData().toString());
                    outState.putBundle(BUNDLE_PLUGIN_CALL_BUNDLE_KEY, bundle);
                } else {
                    Logger.error("Couldn't save last " + call.getPluginId() + "'s Plugin " + call.getMethodName() + " call");
                }
            }
        }
    }

    @Deprecated
    @SuppressWarnings("deprecation")
    public void startActivityForPluginWithResult(PluginCall call, Intent intent, int requestCode) {
        Logger.debug("Starting activity for result");

        pluginCallForLastActivity = call;

        getActivity().startActivityForResult(intent, requestCode);
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
    @SuppressWarnings("deprecation")
    boolean onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        PluginHandle plugin = getPluginWithRequestCode(requestCode);

        if (plugin == null) {
            boolean permissionHandled = false;
            Logger.debug("Unable to find a Capacitor plugin to handle permission requestCode, trying Cordova plugins " + requestCode);
            try {
                permissionHandled = cordovaInterface.handlePermissionResult(requestCode, permissions, grantResults);
            } catch (JSONException e) {
                Logger.debug("Error on Cordova plugin permissions request " + e.getMessage());
            }
            return permissionHandled;
        }

        // Call deprecated method if using deprecated NativePlugin annotation
        if (plugin.getPluginAnnotation() == null) {
            plugin.getInstance().handleRequestPermissionsResult(requestCode, permissions, grantResults);
            return true;
        }

        return false;
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
    protected boolean validatePermissions(Plugin plugin, PluginCall savedCall, Map<String, Boolean> permissions) {
        SharedPreferences prefs = getContext().getSharedPreferences(PERMISSION_PREFS_NAME, Activity.MODE_PRIVATE);

        for (Map.Entry<String, Boolean> permission : permissions.entrySet()) {
            String permString = permission.getKey();
            boolean isGranted = permission.getValue();

            if (isGranted) {
                // Permission granted. If previously denied, remove cached state
                String state = prefs.getString(permString, null);

                if (state != null) {
                    SharedPreferences.Editor editor = prefs.edit();
                    editor.remove(permString);
                    editor.apply();
                }
            } else {
                SharedPreferences.Editor editor = prefs.edit();

                if (ActivityCompat.shouldShowRequestPermissionRationale(getActivity(), permString)) {
                    // Permission denied, can prompt again with rationale
                    editor.putString(permString, PermissionState.PROMPT_WITH_RATIONALE.toString());
                } else {
                    // Permission denied permanently, store this state for future reference
                    editor.putString(permString, PermissionState.DENIED.toString());
                }

                editor.apply();
            }
        }

        String[] permStrings = permissions.keySet().toArray(new String[0]);

        if (!PermissionHelper.hasDefinedPermissions(getContext(), permStrings)) {
            StringBuilder builder = new StringBuilder();
            builder.append("Missing the following permissions in AndroidManifest.xml:\n");
            String[] missing = PermissionHelper.getUndefinedPermissions(getContext(), permStrings);
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
     * @return A mapping of permission aliases to the associated granted status.
     */
    protected Map<String, PermissionState> getPermissionStates(Plugin plugin) {
        Map<String, PermissionState> permissionsResults = new HashMap<>();
        CapacitorPlugin annotation = plugin.getPluginHandle().getPluginAnnotation();
        for (Permission perm : annotation.permissions()) {
            // If a permission is defined with no permission constants, return GRANTED for it.
            // Otherwise, get its true state.
            if (perm.strings().length == 0 || (perm.strings().length == 1 && perm.strings()[0].isEmpty())) {
                String key = perm.alias();
                if (!key.isEmpty()) {
                    PermissionState existingResult = permissionsResults.get(key);

                    // auto set permission state to GRANTED if the alias is empty.
                    if (existingResult == null) {
                        permissionsResults.put(key, PermissionState.GRANTED);
                    }
                }
            } else {
                for (String permString : perm.strings()) {
                    String key = perm.alias().isEmpty() ? permString : perm.alias();
                    PermissionState permissionStatus;
                    if (ActivityCompat.checkSelfPermission(this.getContext(), permString) == PackageManager.PERMISSION_GRANTED) {
                        permissionStatus = PermissionState.GRANTED;
                    } else {
                        permissionStatus = PermissionState.PROMPT;

                        // Check if there is a cached permission state for the "Never ask again" state
                        SharedPreferences prefs = getContext().getSharedPreferences(PERMISSION_PREFS_NAME, Activity.MODE_PRIVATE);
                        String state = prefs.getString(permString, null);

                        if (state != null) {
                            permissionStatus = PermissionState.byState(state);
                        }
                    }

                    PermissionState existingResult = permissionsResults.get(key);

                    // multiple permissions with the same alias must all be true, otherwise all false.
                    if (existingResult == null || existingResult == PermissionState.GRANTED) {
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
    @SuppressWarnings("deprecation")
    boolean onActivityResult(int requestCode, int resultCode, Intent data) {
        PluginHandle plugin = getPluginWithRequestCode(requestCode);

        if (plugin == null || plugin.getInstance() == null) {
            Logger.debug("Unable to find a Capacitor plugin to handle requestCode, trying Cordova plugins " + requestCode);
            return cordovaInterface.onActivityResult(requestCode, resultCode, data);
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

        plugin.getInstance().handleOnActivityResult(requestCode, resultCode, data);

        // Clear the plugin call we may have re-hydrated on app launch
        pluginCallForLastActivity = null;

        return true;
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
     * Handle an onConfigurationChanged event and notify the plugins
     * @param newConfig
     */
    public void onConfigurationChanged(Configuration newConfig) {
        for (PluginHandle plugin : plugins.values()) {
            plugin.getInstance().handleOnConfigurationChanged(newConfig);
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

    /**
     * Reload the WebView
     */
    public void reload() {
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

    public Set<String> getAllowedOriginRules() {
        return allowedOriginRules;
    }

    public BridgeWebViewClient getWebViewClient() {
        return this.webViewClient;
    }

    public void setWebViewClient(BridgeWebViewClient client) {
        this.webViewClient = client;
        webView.setWebViewClient(client);
    }

    List<WebViewListener> getWebViewListeners() {
        return webViewListeners;
    }

    void setWebViewListeners(List<WebViewListener> webViewListeners) {
        this.webViewListeners = webViewListeners;
    }

    RouteProcessor getRouteProcessor() {
        return routeProcessor;
    }

    void setRouteProcessor(RouteProcessor routeProcessor) {
        this.routeProcessor = routeProcessor;
    }

    ServerPath getServerPath() {
        return serverPath;
    }

    /**
     * Add a listener that the WebViewClient can trigger on certain events.
     * @param webViewListener A {@link WebViewListener} to add.
     */
    public void addWebViewListener(WebViewListener webViewListener) {
        webViewListeners.add(webViewListener);
    }

    /**
     * Remove a listener that the WebViewClient triggers on certain events.
     * @param webViewListener A {@link WebViewListener} to remove.
     */
    public void removeWebViewListener(WebViewListener webViewListener) {
        webViewListeners.remove(webViewListener);
    }

    public static class Builder {

        private Bundle instanceState = null;
        private CapConfig config = null;
        private List<Class<? extends Plugin>> plugins = new ArrayList<>();
        private List<Plugin> pluginInstances = new ArrayList<>();
        private AppCompatActivity activity;
        private Fragment fragment;
        private RouteProcessor routeProcessor;
        private final List<WebViewListener> webViewListeners = new ArrayList<>();
        private ServerPath serverPath;

        public Builder(AppCompatActivity activity) {
            this.activity = activity;
        }

        public Builder(Fragment fragment) {
            this.activity = (AppCompatActivity) fragment.getActivity();
            this.fragment = fragment;
        }

        public Builder setInstanceState(Bundle instanceState) {
            this.instanceState = instanceState;
            return this;
        }

        public Builder setConfig(CapConfig config) {
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

        public Builder addPluginInstance(Plugin plugin) {
            this.pluginInstances.add(plugin);
            return this;
        }

        public Builder addPluginInstances(List<Plugin> plugins) {
            this.pluginInstances.addAll(plugins);
            return this;
        }

        public Builder addWebViewListener(WebViewListener webViewListener) {
            webViewListeners.add(webViewListener);
            return this;
        }

        public Builder addWebViewListeners(List<WebViewListener> webViewListeners) {
            for (WebViewListener listener : webViewListeners) {
                this.addWebViewListener(listener);
            }

            return this;
        }

        public Builder setRouteProcessor(RouteProcessor routeProcessor) {
            this.routeProcessor = routeProcessor;
            return this;
        }

        public Builder setServerPath(ServerPath serverPath) {
            this.serverPath = serverPath;
            return this;
        }

        public Bridge create() {
            // Cordova initialization
            ConfigXmlParser parser = new ConfigXmlParser();
            parser.parse(activity.getApplicationContext());
            CordovaPreferences preferences = parser.getPreferences();
            preferences.setPreferencesBundle(activity.getIntent().getExtras());
            List<PluginEntry> pluginEntries = parser.getPluginEntries();

            MockCordovaInterfaceImpl cordovaInterface = new MockCordovaInterfaceImpl(activity);
            if (instanceState != null) {
                cordovaInterface.restoreInstanceState(instanceState);
            }

            WebView webView = this.fragment != null ? fragment.getView().findViewById(R.id.webview) : activity.findViewById(R.id.webview);
            MockCordovaWebViewImpl mockWebView = new MockCordovaWebViewImpl(activity.getApplicationContext());
            mockWebView.init(cordovaInterface, pluginEntries, preferences, webView);
            PluginManager pluginManager = mockWebView.getPluginManager();
            cordovaInterface.onCordovaInit(pluginManager);

            // Bridge initialization
            Bridge bridge = new Bridge(
                activity,
                serverPath,
                fragment,
                webView,
                plugins,
                pluginInstances,
                cordovaInterface,
                pluginManager,
                preferences,
                config
            );

            if (webView instanceof CapacitorWebView capacitorWebView) {
                capacitorWebView.setBridge(bridge);
                capacitorWebView.edgeToEdgeHandler(bridge);
            }

            bridge.setCordovaWebView(mockWebView);
            bridge.setWebViewListeners(webViewListeners);
            bridge.setRouteProcessor(routeProcessor);

            if (instanceState != null) {
                bridge.restoreInstanceState(instanceState);
            }

            return bridge;
        }
    }
}
