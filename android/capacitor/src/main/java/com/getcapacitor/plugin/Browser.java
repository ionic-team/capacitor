package com.getcapacitor.plugin;

import android.content.ComponentName;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.support.customtabs.CustomTabsClient;
import android.support.customtabs.CustomTabsIntent;
import android.support.customtabs.CustomTabsServiceConnection;
import android.support.customtabs.CustomTabsSession;
import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;
import org.json.JSONException;

/**
 * The Browser plugin implements Custom Chrome Tabs. See
 * https://developer.chrome.com/multidevice/android/customtabs for background
 * on how this code works.
 */
@NativePlugin(requestCodes={PluginRequestCodes.BROWSER_OPEN_CHROME_TAB})
public class Browser extends Plugin {
  public static final String CUSTOM_TAB_PACKAGE_NAME = "com.android.chrome";  // Change when in stable

  private CustomTabsClient customTabsClient;
  private CustomTabsSession currentSession;

  @PluginMethod()
  public void open(PluginCall call) {
    String url = call.getString("url");
    String toolbarColor = call.getString("toolbarColor");

    if (url == null) {
      call.error("Must provide a URL to open");
      return;
    }

    if (url.isEmpty()) {
      call.error("URL must not be empty");
      return;
    }

    CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder(getCustomTabsSession());

    builder.addDefaultShareMenuItem();

    if (toolbarColor != null) {
      try {
        builder.setToolbarColor(Color.parseColor(toolbarColor));
      } catch (IllegalArgumentException ex) {
        Log.e(getLogTag(), "Invalid color provided for toolbarColor. Using default");
      }
    }

    CustomTabsIntent tabsIntent = builder.build();
    tabsIntent.intent.putExtra(Intent.EXTRA_REFERRER,
        Uri.parse(Intent.URI_ANDROID_APP_SCHEME + "//" + getContext().getPackageName()));
    tabsIntent.launchUrl(getContext(), Uri.parse(url));
  }

  @PluginMethod()
  public void close(PluginCall call) {
    call.unimplemented();
  }


  @PluginMethod()
  public void prefetch(PluginCall call) {
    JSArray urls = call.getArray("urls");
    if (urls == null || urls.length() == 0) {
      call.error("Must provide an array of URLs to prefetch");
      return;
    }

    CustomTabsSession session = getCustomTabsSession();

    if (session == null) {
      call.error("Browser session isn't ready yet");
      return;
    }

    try {
      for (String url : urls.<String>toList()) {
        session.mayLaunchUrl(Uri.parse(url), null, null);
      }
    } catch(JSONException ex) {
      call.error("Unable to process provided urls list. Ensure each item is a string and valid URL", ex);
      return;
    }
  }

  CustomTabsServiceConnection connection = new CustomTabsServiceConnection() {
    @Override
    public void onCustomTabsServiceConnected(ComponentName name, CustomTabsClient client) {
      customTabsClient = client;
      client.warmup(0);
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
    }
  };

  public void load() {
  }

  protected void handleOnResume() {
    boolean ok = CustomTabsClient.bindCustomTabsService(getContext(), CUSTOM_TAB_PACKAGE_NAME, connection);
    if (!ok) {
      Log.e(getLogTag(), "Error binding to custom tabs service");
    }
  }

  protected void handleOnPause() {
    getContext().unbindService(connection);
  }

  public CustomTabsSession getCustomTabsSession() {
    if (customTabsClient == null) {
      return null;
    }

    if (currentSession == null) {
      currentSession = customTabsClient.newSession(null);
    }

    return currentSession;
  }

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);
  }
}
