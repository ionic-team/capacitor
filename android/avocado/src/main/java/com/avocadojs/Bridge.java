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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Collection;
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

  private Map<String, KnownPlugin> plugins = new HashMap<>();


  public Bridge(Activity context, WebView webView) {
    this.context = context;
    this.webView = webView;
    this.msgHandler = new MessageHandler(this, webView);

    Log.d(TAG, "Loading web app from " + DEFAULT_WEB_ASSET_DIR + "/index.html");

    // Start the local web server
    final WebViewLocalServer localServer = new WebViewLocalServer(context, getJSInjector());
    WebViewLocalServer.AssetHostingDetails ahd = localServer.hostAssets(DEFAULT_WEB_ASSET_DIR);

    webView.setWebViewClient(new WebViewClient() {
      @Override
      public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        return localServer.shouldInterceptRequest(request);
      }
    });

    // Load the index.html file from our www folder
    String url = ahd.getHttpsPrefix().buildUpon().appendPath("index.html").build().toString();
    webView.loadUrl(url);

    this.registerCorePlugins();
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

    String pluginId = pluginClass.getName();
    Log.d(Bridge.TAG, "Registering plugin: " + pluginId);

    try {
      this.plugins.put(pluginId, new KnownPlugin(this, pluginClass));
    } catch(InvalidPluginException ex) {
      Log.e(Bridge.TAG, "NativePlugin " + pluginClass.getName() +
          " is invalid. Ensure the @NativePlugin annotation exists on the plugin class and" +
          " the class extends Plugin");
    } catch(JSExportException ex) {
      Log.e(TAG, "Unable to export JavaScript for plugin \"" + pluginId + "\". Plugin will not function!", ex);
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
          try {
            plugin.invoke(methodName, call);
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

  /**
   * Build the JSInjector that will be used to inject JS into files served to the app,
   * to ensure that Avocado's JS and the JS for all the plugins is loaded each time.
   */
  private JSInjector getJSInjector() {
    try {
      String coreJS = getCoreJS();
      String pluginJS = getPluginJS();

      return new JSInjector(coreJS, pluginJS);
    } catch(IOException ex) {
      Log.e(TAG, "Unable to inject Avocado JS. App will not function!", ex);
    }
    return null;
  }

  private String getCoreJS() throws IOException {
    BufferedReader br = new BufferedReader(
        new InputStreamReader(context.getAssets().open("public/native-bridge.js")));

    StringBuffer b = new StringBuffer();
    String line;
    while((line = br.readLine()) != null) {
      b.append(line + "\n");
    }

    return b.toString();
  }

  private String getPluginJS() {
    StringBuilder b = new StringBuilder();


    for(KnownPlugin plugin : this.plugins.values()) {
      b.append("(function(w) {\n" +
          "var a = w.Avocado; var p = a.Plugins;\n" +
          "var t = p['" + plugin.getId() + "'] = {};\n" +
          "t.addListener = function(eventName, callback) {\n" +
          "  return w.Avocado.addListener('" + plugin.getId() + "', eventName, callback);\n" +
          "}\n" +
          "t.removeListener = function(eventName, callback) {\n" +
          "  return w.Avocado.removeListener('" + plugin.getId() + "', eventName, callback);\n" +
          "}");


      Collection<PluginMethodHandle> methods = plugin.getMethods();

      for(PluginMethodHandle method : methods) {
        b.append(generateMethodJS(method));
      }
    }

    b.append("})(window);");

    return b.toString();
  }

  private String generateMethodJS(PluginMethodHandle method) {

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
