package com.avocadojs;

import android.content.Context;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;


public class Avocado {
  private Context context;
  private WebView webView;
  private MessageHandler msgHandler;

  private Map<String, KnownPlugin> plugins = new HashMap<>();


  public Avocado(Context context, WebView webView) {
    this.context = context;
    this.webView = webView;
    this.msgHandler = new MessageHandler(this, webView);


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

  /**
   * Register a plugin class
   * @param pluginClass a class inheriting from PluginBase
   */
  public void registerPlugin(Class<? extends PluginBase> pluginClass) {
    Plugin pluginAnnotation = pluginClass.getAnnotation(Plugin.class);

    if(pluginAnnotation == null) {
      Log.e("Avocado:registerPlugin", "Plugin doesn't have the @Plugin annotation. Please add it");
      return;
    }

    String pluginId = pluginAnnotation.id();

    try {
      this.plugins.put(pluginId, new KnownPlugin(pluginClass));
    } catch(InvalidPluginException ex) {
      Log.e("Avocado:registerPlugin", "Plugin " + pluginClass.getName() +
          " is invalid. Ensure the @Plugin annotation exists on the plugin class and" +
          " the class extends PluginBase");
    }
  }

  public KnownPlugin getPlugin(String pluginId) {
    return this.plugins.get(pluginId);
  }


  public Context getContext() {
    return this.context;
  }

  public WebView getWebView() {
    return this.webView;
  }

}
