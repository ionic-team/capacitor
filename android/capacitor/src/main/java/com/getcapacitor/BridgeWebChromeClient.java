package com.getcapacitor;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
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

import org.apache.cordova.CordovaPlugin;

/**
 * Custom WebChromeClient handler, required for showing dialogs, confirms, etc. in our
 * WebView instance.
 */
public class BridgeWebChromeClient extends WebChromeClient {
  private Bridge bridge;
  static final int FILE_CHOOSER = PluginRequestCodes.FILE_CHOOSER;

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
    Log.d(LogUtils.getCoreTag(), "onGeolocationPermissionsShowPrompt: DOING IT HERE FOR ORIGIN: " + origin);

    // Set that we want geolocation perms for this origin
    callback.invoke(origin, true, false);

    Plugin geo = bridge.getPlugin("Geolocation").getInstance();
    if (!geo.hasRequiredPermissions()) {
      geo.pluginRequestAllPermissions();
    } else {
      Log.d(LogUtils.getCoreTag(), "onGeolocationPermissionsShowPrompt: has required permis");
    }
  }

  @Override
  public boolean onShowFileChooser(WebView webView, final ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
    Intent intent = fileChooserParams.createIntent();
    if (fileChooserParams.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) {
      intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
    }
    try {
      bridge.cordovaInterface.startActivityForResult(new CordovaPlugin() {
        @Override
        public void onActivityResult(int requestCode, int resultCode, Intent intent) {
          Uri[] result;
          if (resultCode == Activity.RESULT_OK && intent.getClipData() != null && intent.getClipData().getItemCount() > 1) {
            final int numFiles = intent.getClipData().getItemCount();
            result = new Uri[numFiles];
            for (int i = 0; i < numFiles; i++) {
              result[i] = intent.getClipData().getItemAt(i).getUri();

            }
          } else {
            result = WebChromeClient.FileChooserParams.parseResult(resultCode, intent);
          }
          filePathCallback.onReceiveValue(result);
        }
      }, intent, FILE_CHOOSER);
    } catch (ActivityNotFoundException e) {
      filePathCallback.onReceiveValue(null);
    }
    return true;
  }

  @Override
  public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
    return true;
  }
}
