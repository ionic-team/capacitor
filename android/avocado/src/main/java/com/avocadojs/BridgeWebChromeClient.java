package com.avocadojs;

import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import com.avocadojs.plugin.Geolocation;

/**
 * Custom WebChromeClient handler, required for showing dialogs, confirms, etc.
 */
public class BridgeWebChromeClient extends WebChromeClient {
  private Bridge bridge;

  public BridgeWebChromeClient(Bridge bridge) {
    this.bridge = bridge;
  }

  @Override
  public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
    Dialogs.alert(view.getContext(), message, new Dialogs.OnResultListener() {
      @Override
      public void onResult(boolean value, boolean didCancel, String inputValue) {
        if(value) {
          result.confirm();
        } else {
          result.cancel();
        }
      }
    });

    return true;
  }

  @Override
  public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
    Dialogs.confirm(view.getContext(), message, new Dialogs.OnResultListener() {
      @Override
      public void onResult(boolean value, boolean didCancel, String inputValue) {
        if(value) {
          result.confirm();
        } else {
          result.cancel();
        }
      }
    });

    return true;
  }

  @Override
  public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, final JsPromptResult result) {
    Dialogs.prompt(view.getContext(), message, new Dialogs.OnResultListener() {
      @Override
      public void onResult(boolean value, boolean didCancel, String inputValue) {
        if(value) {
          result.confirm(inputValue);
        } else {
          result.cancel();
        }
      }
    });

    return true;
  }

  @Override
  public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
    super.onGeolocationPermissionsShowPrompt(origin, callback);


    // Set that we want geolocation perms for this origin
    callback.invoke(origin, true, false);

    Plugin geo = bridge.getPlugin("Geolocation").getInstance();
    if (!geo.hasRequiredPermissions()) {
      geo.pluginRequestAllPermissions();
    }
  }
}
