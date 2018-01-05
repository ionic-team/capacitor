package com.avocadojs;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.avocadojs.plugin.Accessibility;
import com.avocadojs.plugin.AppState;
import com.avocadojs.plugin.Browser;
import com.avocadojs.plugin.Camera;
import com.avocadojs.plugin.Clipboard;
import com.avocadojs.plugin.Console;
import com.avocadojs.plugin.Device;
import com.avocadojs.plugin.Filesystem;
import com.avocadojs.plugin.Geolocation;
import com.avocadojs.plugin.Keyboard;
import com.avocadojs.plugin.Modals;
import com.avocadojs.plugin.StatusBar;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;


/**
 * Bridge is the main entrypoint for Avocado
 */
public class Bridge {
  public static final String TAG = "Avocado";

  // The name of the directory we use to look for index.html and the rest of our web assets
  public static final String DEFAULT_WEB_ASSET_DIR = "public";

  private final Activity context;
  private final WebView webView;
  private final MessageHandler msgHandler;

  private final Handler taskHandler = new Handler();

  private Map<String, PluginHandle> plugins = new HashMap<>();

  // Stored plugin calls that we're keeping around to call again someday
  private Map<String, PluginCall> savedCalls = new HashMap<>();

  // Any URI that was passed to the app on start
  private Uri intentUri;


  public Bridge(Activity context, WebView webView) {
    this.context = context;
    this.webView = webView;

    this.initWebView();

    this.msgHandler = new MessageHandler(this, webView);

    Intent intent = context.getIntent();
    Uri intentData = intent.getData();
    this.intentUri = intentData;

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

    webView.loadUrl(url);
  }

  public Context getContext() {
    return this.context;
  }

  public Activity getActivity() { return this.context; }

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

  public void initWebView() {
    Log.d(TAG, "Initializing web view");
    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setGeolocationEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setAppCacheEnabled(true);
  }

  public void registerCorePlugins() {
    this.registerPlugin(AppState.class);
    this.registerPlugin(Accessibility.class);
    this.registerPlugin(Browser.class);
    this.registerPlugin(Camera.class);
    this.registerPlugin(Console.class);
    this.registerPlugin(Clipboard.class);
    this.registerPlugin(Device.class);
    this.registerPlugin(Filesystem.class);
    this.registerPlugin(Geolocation.class);
    this.registerPlugin(Keyboard.class);
    this.registerPlugin(Modals.class);
    this.registerPlugin(StatusBar.class);
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

            if(call.isSaved()) {
              saveCall(call);
            }
          } catch(PluginLoadException | InvalidPluginMethodException | PluginInvocationException ex) {
            Log.e(Bridge.TAG, "Unable to execute plugin method", ex);
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

  public void saveCall(PluginCall call) {
    this.savedCalls.put(call.getCallbackId(), call);
  }

  /**
   * Get a saved plugin call
   * @param callbackId the callbackId to use to lookup the call with
   * @return the stored call
   */
  public PluginCall getSavedCall(String callbackId) {
    return this.savedCalls.get(callbackId);
  }

  /**
   * Remove the saved call
   * @param callbackId
   */
  public void removeSavedCall(String callbackId) {
    this.savedCalls.remove(callbackId);
  }

  /**
   * Build the JSInjector that will be used to inject JS into files served to the app,
   * to ensure that Avocado's JS and the JS for all the plugins is loaded each time.
   */
  private JSInjector getJSInjector() {
    try {
      String coreJS = JSExport.getCoreJS(context);
      String pluginJS = JSExport.getPluginJS(plugins.values());

      return new JSInjector(coreJS, pluginJS);
    } catch(JSExportException ex) {
      Log.e(TAG, "Unable to export Avocado JS. App will not function!", ex);
    }
    return null;
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

    if(plugin == null) {
      Log.d(Bridge.TAG, "Unable to find a plugin to handle requestCode " + requestCode);
      return;
    }

    plugin.getInstance().handleRequestPermissionsResult(requestCode, permissions, grantResults);
  }

  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    PluginHandle plugin = getPluginWithRequestCode(requestCode);

    if(plugin == null || plugin.getInstance() == null) {
      Log.d(Bridge.TAG, "Unable to find a plugin to handle requestCode " + requestCode);
      return;
    }

    plugin.getInstance().handleOnActivityResult(requestCode, resultCode, data);
  }
}
