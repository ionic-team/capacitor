package com.avocadojs.plugin;

import android.net.Uri;
import android.support.customtabs.CustomTabsIntent;

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;
import com.avocadojs.PluginRequestCodes;

@NativePlugin(requestCodes={PluginRequestCodes.BROWSER_OPEN_CHROME_TAB})
public class Browser extends Plugin {

  @PluginMethod()
  public void open(PluginCall call) {
    String url = call.getString("url");

    if (url == null) {
      call.error("Must provide a URL");
      return;
    }

    CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
    CustomTabsIntent tabsIntent = builder.build();
    tabsIntent.launchUrl(getContext(), Uri.parse(url));
  }

  @PluginMethod()
  public void close(PluginCall call) {
    // Not supported
    call.success();
  }
}
