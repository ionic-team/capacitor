package com.getcapacitor;

import android.net.Uri;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

/**
 * Custom WebChromeClient handler, required for showing dialogs, confirms, etc. in our
 * WebView instance.
 */
public class BridgeWebChromeClient extends WebChromeClient {
  private Bridge bridge;

  public BridgeWebChromeClient(Bridge bridge) {
    this.bridge = bridge;
  }

  @Override
  public void onPermissionRequest(final PermissionRequest request) {
    request.grant(request.getResources());
  }

  /**
   * Show the browser alert modal
   * @param view
   * @param url
   * @param message
   * @param result
   * @return
   */
  @Override
  public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
    if (bridge.getActivity().isFinishing()) {
      return true;
    }

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

  /**
   * Show the browser confirm modal
   * @param view
   * @param url
   * @param message
   * @param result
   * @return
   */
  @Override
  public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
    if (bridge.getActivity().isFinishing()) {
      return true;
    }

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

  /**
   * Show the browser prompt modal
   * @param view
   * @param url
   * @param message
   * @param defaultValue
   * @param result
   * @return
   */
  @Override
  public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, final JsPromptResult result) {
    if (bridge.getActivity().isFinishing()) {
      return true;
    }

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

  /**
   * Handle the browser geolocation prompt
   * @param origin
   * @param callback
   */
  @Override
  public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
    super.onGeolocationPermissionsShowPrompt(origin, callback);
    Log.d(Bridge.TAG, "onGeolocationPermissionsShowPrompt: DOING IT HERE FOR ORIGIN: " + origin);

    // Set that we want geolocation perms for this origin
    callback.invoke(origin, true, false);

    Plugin geo = bridge.getPlugin("Geolocation").getInstance();
    if (!geo.hasRequiredPermissions()) {
      geo.pluginRequestAllPermissions();
    } else {
      Log.d(bridge.TAG, "onGeolocationPermissionsShowPrompt: has required permis");
    }
  }

  @Override
  public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
    return super.onShowFileChooser(webView, filePathCallback, fileChooserParams);
  }

  @Override
  public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
    return true;
  }
}
