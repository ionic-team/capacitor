package com.avocadojs.plugin;

import android.content.ComponentName;
import android.graphics.Color;
import android.net.Uri;
import android.support.customtabs.CustomTabsClient;
import android.support.customtabs.CustomTabsIntent;
import android.support.customtabs.CustomTabsServiceConnection;
import android.util.Log;

import com.avocadojs.Bridge;
import com.avocadojs.JSArray;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;
import com.avocadojs.PluginRequestCodes;

import org.json.JSONException;

@NativePlugin(requestCodes={PluginRequestCodes.BROWSER_OPEN_CHROME_TAB})
public class Browser extends Plugin {
  public static final String CUSTOM_TAB_PACKAGE_NAME = "com.android.chrome";  // Change when in stable

  private CustomTabsClient customTabsClient;

  CustomTabsServiceConnection connection = new CustomTabsServiceConnection() {
    @Override
    public void onCustomTabsServiceConnected(ComponentName name, CustomTabsClient client) {
      Log.d(Bridge.TAG, "Connected to custom tabs service: " + name.toString());
      customTabsClient = client;
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
      Log.d(Bridge.TAG, "Disconnected from custom tabs service: " + name.toString());
    }
  };

  public void load() {
    boolean ok = CustomTabsClient.bindCustomTabsService(getContext(), CUSTOM_TAB_PACKAGE_NAME, connection);
  }

  @PluginMethod()
  public void open(PluginCall call) {
    String url = call.getString("url");
    String toolbarColor = call.getString("toolbarColor");

    if (url == null) {
      call.error("Must provide a URL");
      return;
    }

    CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();

    if (toolbarColor != null) {
      try {
        builder.setToolbarColor(Color.parseColor(toolbarColor));
      } catch (IllegalArgumentException ex) {
        Log.e(Bridge.TAG, "Browser: Invalid color provided for toolbarColor. Using default");
      }
    }

    CustomTabsIntent tabsIntent = builder.build();
    tabsIntent.launchUrl(getContext(), Uri.parse(url));
  }

  @PluginMethod()
  public void close(PluginCall call) {
    // Not supported
    call.success();
  }

  @PluginMethod()
  public void prefetch(PluginCall call) {
    JSArray urls = call.getArray("urls");
    if (urls == null || urls.length() == 0) {
      call.error("Must provide an array of URLs to prefetch");
      return;
    }

    for(int i = 0; i < urls.length(); i++) {
      try {
        String url = urls.getString(i);
      } catch(JSONException ex) {
        Log.e(Bridge.TAG, "Invalid URL supplied to Browser.prefetch", ex);
      }
    }
  }
}
