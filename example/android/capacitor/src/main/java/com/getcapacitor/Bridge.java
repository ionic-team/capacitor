package com.getcapacitor;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.plugin.Accessibility;
import com.getcapacitor.plugin.App;
import com.getcapacitor.plugin.Browser;
import com.getcapacitor.plugin.Camera;
import com.getcapacitor.plugin.Clipboard;
import com.getcapacitor.plugin.Console;
import com.getcapacitor.plugin.Device;
import com.getcapacitor.plugin.Filesystem;
import com.getcapacitor.plugin.Geolocation;
import com.getcapacitor.plugin.Haptics;
import com.getcapacitor.plugin.Keyboard;
import com.getcapacitor.plugin.Modals;
import com.getcapacitor.plugin.Network;
import com.getcapacitor.plugin.Photos;
import com.getcapacitor.plugin.SplashScreen;
import com.getcapacitor.plugin.StatusBar;

import java.util.HashMap;
import java.util.Map;


/**
 * Bridge is the main entrypoint for Capacitor
 */
public class Bridge {
  private static final String BUNDLE_LAST_PLUGIN_KEY = "capacitorLastActivityPlugin";

  public static final String TAG = "Capacitor";

  // The name of the directory we use to look for index.html and the rest of our web assets
  public static final String DEFAULT_WEB_ASSET_DIR = "public";

  // A reference to the main activity for the app
  private final Activity context;
  // A reference to the main WebView for the app
  private final WebView webView;

  // Our MessageHandler for sending and receiving data to the WebView
  private final MessageHandler msgHandler;

  // The ThreadHandler for executing plugin calls
  private final HandlerThread handlerThread = new HandlerThread("CapacitorPlugins");

  // Our Handler for posting plugin calls. Created from the ThreadHandler
  private Handler taskHandler = null;

  // A map of Plugin Id's to PluginHandle's
  private Map<String, PluginHandle> plugins = new HashMap<>();

  // Stored plugin calls that we're keeping around to call again someday
  private Map<String, PluginCall> savedCalls = new HashMap<>();

  // Store a plugin call that started a new activity, in case we need to resume
  // the app and return that data back
  private Plugin pluginForLastActivity;

  // Any URI that was passed to the app on start
  private Uri intentUri;


  public Bridge(Activity context, WebView webView) {
    this.context = context;
    this.webView = webView;

    // Start our plugin execution threads and handlers
    handlerThread.start();
    taskHandler = new Handler(handlerThread.getLooper());

    // Initialize web view and message handler for it
    this.initWebView();
    this.msgHandler = new MessageHandler(this, webView);

    // Grab any intent info that our app was launched with
    Intent intent = context.getIntent();
    Uri intentData = intent.getData();
    this.intentUri = intentData;

    // Register our core plugins
    this.registerCorePlugins();

    Log.d(TAG, "Loading app from " + DEFAULT_WEB_ASSET_DIR + "/index.html");

    // Start the local web server
    final WebViewLocalServer localServer = new WebViewLocalServer(context, getJSInjector());
    WebViewLocalServer.AssetHostingDetails ahd = localServer.hostAssets(DEFAULT_WEB_ASSET_DIR);
    webView.setWebChromeClient(new BridgeWebChromeClient(this));
    webView.setWebViewClient(new WebViewClient() {
      @Override
      public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        return localServer.shouldInterceptRequest(request);
      }
    });

    // Load the index.html file from our www folder
    String url = ahd.getHttpsPrefix().buildUpon().appendPath("index.html").build().toString();

    // Get to work
    webView.loadUrl(url);
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
  public Activity getActivity() { return this.context; }

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

  /*
  public void registerPlugins() {
    Log.d(TAG, "Finding plugins");
    try {
      Enumeration<URL> roots = getClass().getClassLoader().getResources("");
      while (roots.hasMoreElements()) {
        URL url = roots.nextElement();
        Log.d(TAG, "CLASSAPTH ROOT: " + url.getPath());
        //File root = new File(url.getPath());
      }
    } catch(Exception ex) {
      Log.e(TAG, "Unable to query for plugin classes", ex);
    }
  }
  */

  /**
   * Initialize the WebView, setting required flags
   */
  public void initWebView() {
    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setGeolocationEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setAppCacheEnabled(true);
  }

  /**
   * Register our core Plugin APIs
   */
  public void registerCorePlugins() {
    this.registerPlugin(App.class);
    this.registerPlugin(Accessibility.class);
    this.registerPlugin(Browser.class);
    this.registerPlugin(Camera.class);
    this.registerPlugin(Clipboard.class);
    this.registerPlugin(Console.class);
    this.registerPlugin(Device.class);
    this.registerPlugin(Filesystem.class);
    this.registerPlugin(Geolocation.class);
    this.registerPlugin(Haptics.class);
    this.registerPlugin(Keyboard.class);
    this.registerPlugin(Modals.class);
    this.registerPlugin(Network.class);
    this.registerPlugin(Photos.class);
    this.registerPlugin(SplashScreen.class);
    this.registerPlugin(StatusBar.class);
  }

  /**
   * Register additional plugins
   * @param plugins the plugins to register
   */
  public void registerPlugins(Plugin[] plugins) {
    for (Plugin plugin : plugins) {
      this.registerPlugin(plugin.getClass());
    }
  }

  /**
   * Register a plugin class
   * @param pluginClass a class inheriting from Plugin
   */
  public void registerPlugin(Class<? extends Plugin> pluginClass) {
    NativePlugin pluginAnnotation = pluginClass.getAnnotation(NativePlugin.class);

    if (pluginAnnotation == null) {
      Log.e(Bridge.TAG, "NativePlugin doesn't have the @NativePlugin annotation. Please add it");
      return;
    }

    String pluginId = pluginClass.getSimpleName();
    Log.d(Bridge.TAG, "Registering plugin: " + pluginId);

    try {
      this.plugins.put(pluginId, new PluginHandle(this, pluginClass));
    } catch (InvalidPluginException ex) {
      Log.e(TAG, "NativePlugin " + pluginClass.getName() +
          " is invalid. Ensure the @NativePlugin annotation exists on the plugin class and" +
          " the class extends Plugin");
    } catch (PluginLoadException ex) {
      Log.e(TAG, "NativePlugin " + pluginClass.getName() + " failed to load", ex);
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
      NativePlugin pluginAnnotation = handle.getPluginAnnotation();
      if (pluginAnnotation == null) {
        continue;
      }

      int[] requestCodes = pluginAnnotation.requestCodes();
      for (int rc : requestCodes) {
        if (rc == requestCode) {
          return handle;
        }
      }

      if (pluginAnnotation.permissionRequestCode() == requestCode) {
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
        Log.e(Bridge.TAG, "unable to find plugin : " + pluginId);
        call.errorCallback("unable to find plugin : " + pluginId);
        return;
      }

      Log.d(Bridge.TAG, "callback: " + call.getCallbackId() +
          ", pluginId: " + plugin.getId() +
          ", methodName: " + methodName + ", methodData: " + call.getData().toString());

      Runnable currentThreadTask = new Runnable() {
        @Override
        public void run() {
          try {
            plugin.invoke(methodName, call);

            if (call.isRetained()) {
              retainCall(call);
            }
          } catch(PluginLoadException | InvalidPluginMethodException | PluginInvocationException ex) {
            Log.e(Bridge.TAG, "Unable to execute plugin method", ex);
          } catch(Exception ex) {
            Log.e(Bridge.TAG, "Serious error executing plugin", ex);
          }
        }
      };

      taskHandler.post(currentThreadTask);

    } catch (Exception ex) {
      Log.e("callPluginMethod", "error : " + ex);
      call.errorCallback(ex.toString());
    }
  }

  public void execute(Runnable runnable) {
    taskHandler.post(runnable);
  }

  /**
   * Retain a call between plugin invocations
   * @param call
   */
  public void retainCall(PluginCall call) {
    this.savedCalls.put(call.getCallbackId(), call);
  }


  /**
   * Get a retained plugin call
   * @param callbackId the callbackId to use to lookup the call with
   * @return the stored call
   */
  public PluginCall getRetainedCall(String callbackId) {
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
   * Build the JSInjector that will be used to inject JS into files served to the app,
   * to ensure that Capacitor's JS and the JS for all the plugins is loaded each time.
   */
  private JSInjector getJSInjector() {
    try {
      String coreJS = JSExport.getCoreJS(context);
      String pluginJS = JSExport.getPluginJS(plugins.values());

      return new JSInjector(coreJS, pluginJS);
    } catch(JSExportException ex) {
      Log.e(TAG, "Unable to export Capacitor JS. App will not function!", ex);
    }
    return null;
  }

  public void saveInstanceState(Bundle outState) {
    Log.d(TAG, "Saving instance state!");

    // Store the last plugin that started this activity, so we
    // can send any result we might get back to it, even if the app
    // is killed (to free up memory, for example)
    if (pluginForLastActivity != null) {
      outState.putString(BUNDLE_LAST_PLUGIN_KEY, pluginForLastActivity.getPluginHandle().getId());
    }
  }

  public void startActivityForPluginWithResult(Plugin plugin, Intent intent, int requestCode) {
    pluginForLastActivity = plugin;
    Log.d(TAG, "Starting activity for result");
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
      Log.d(Bridge.TAG, "Unable to find a plugin to handle requestCode " + requestCode);
      return;
    }

    plugin.getInstance().handleRequestPermissionsResult(requestCode, permissions, grantResults);
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
      Log.d(Bridge.TAG, "Unable to find a plugin to handle requestCode " + requestCode);
      return;
    }

    plugin.getInstance().handleOnActivityResult(requestCode, resultCode, data);
  }

  /**
   * Handle an onNewIntent lifecycle event and notify the plugins
   * @param intent
   */
  public void onNewIntent(Intent intent) {
    for (PluginHandle plugin : plugins.values()) {
      plugin.getInstance().handleOnNewIntent(intent);
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
  }

  /**
   * Handle onResume lifecycle event and notify the plugins
   */
  public void onResume() {
    for (PluginHandle plugin : plugins.values()) {
      plugin.getInstance().handleOnResume();
    }
  }

  /**
   * Handle onPause lifecycle event and notify the plugins
   */
  public void onPause() {
    for (PluginHandle plugin : plugins.values()) {
      plugin.getInstance().handleOnPause();
    }
  }

  /**
   * Handle onStop lifecycle event and notify the plugins
   */
  public void onStop() {
    for (PluginHandle plugin : plugins.values()) {
      plugin.getInstance().handleOnStop();
    }
  }
}
