package com.avocadojs;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.avocadojs.plugin.Camera;
import com.avocadojs.plugin.Clipboard;
import com.avocadojs.plugin.Console;
import com.avocadojs.plugin.Device;
import com.avocadojs.plugin.Filesystem;
import com.avocadojs.plugin.Keyboard;
import com.avocadojs.plugin.Modals;
import com.avocadojs.plugin.StatusBar;

import java.security.Key;
import java.util.HashMap;
import java.util.Map;


/**
 * Bridge is the main entrypoint for Avocado
 */
public class Bridge {
  public static final String TAG = "Avocado";

  private final Activity context;
  private final WebView webView;
  private final MessageHandler msgHandler;

  private final Handler taskHandler = new Handler();

  private Map<String, KnownPlugin> plugins = new HashMap<>();


  public Bridge(Activity context, WebView webView) {
    this.context = context;
    this.webView = webView;
    this.msgHandler = new MessageHandler(this, webView);

    this.registerCorePlugins();

    // Start the local web server
    final WebViewLocalServer localServer = new WebViewLocalServer(context);
    WebViewLocalServer.AssetHostingDetails ahd = localServer.hostAssets("www");

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


  public void registerCorePlugins() {
    this.registerPlugin(Camera.class);
    this.registerPlugin(Console.class);
    this.registerPlugin(Clipboard.class);
    this.registerPlugin(Device.class);
    this.registerPlugin(Filesystem.class);
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

    if(pluginAnnotation == null) {
      Log.e(Bridge.TAG, "NativePlugin doesn't have the @NativePlugin annotation. Please add it");
      return;
    }

    String pluginId = pluginAnnotation.id();

    try {
      this.plugins.put(pluginId, new KnownPlugin(this, pluginClass));
    } catch(InvalidPluginException ex) {
      Log.e(Bridge.TAG, "NativePlugin " + pluginClass.getName() +
          " is invalid. Ensure the @NativePlugin annotation exists on the plugin class and" +
          " the class extends Plugin");
    }
  }

  public KnownPlugin getPlugin(String pluginId) {
    return this.plugins.get(pluginId);
  }

  public KnownPlugin getPluginWithRequestCode(int requestCode) {
    for(KnownPlugin plugin : this.plugins.values()) {
      NativePlugin pluginAnnotation = plugin.getPluginClass().getAnnotation(NativePlugin.class);
      if(pluginAnnotation == null) {
        continue;
      }

      int[] requestCodes = pluginAnnotation.requestCodes();
      for(int rc : requestCodes) {
        if(rc == requestCode) {
          return plugin;
        }
      }
    }
    return null;
  }

  public void callPluginMethod(String pluginId, final String methodName, final PluginCall call) {
    try {
      final KnownPlugin plugin = this.getPlugin(pluginId);

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
          // since we use current thread (and from onCreate(), it's the UI thread), we can safely update the UI from here
          try {
            plugin.invoke(methodName, call);
          } catch(PluginLoadException | InvalidPluginMethodException | PluginInvocationException ex) {
            Log.e(Bridge.TAG, "Unable to execute plugin method");
            ex.printStackTrace();
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
   * Handle a request permission result by finding the that requested
   * the permission and calling their permission handler
   * @param requestCode the code that was requested
   * @param permissions the permissions requested
   * @param grantResults the set of granted/denied permissions
   */

  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    KnownPlugin plugin = getPluginWithRequestCode(requestCode);

    if(plugin == null) {
      Log.d(Bridge.TAG, "Unable to find a plugin to handle requestCode " + requestCode);
      return;
    }

    plugin.getInstance().handleRequestPermissionsResult(requestCode, permissions, grantResults);
  }

  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    KnownPlugin plugin = getPluginWithRequestCode(requestCode);

    if(plugin == null || plugin.getInstance() == null) {
      Log.d(Bridge.TAG, "Unable to find a plugin to handle requestCode " + requestCode);
      return;
    }

    plugin.getInstance().handleOnActivityResult(requestCode, resultCode, data);
  }
}
