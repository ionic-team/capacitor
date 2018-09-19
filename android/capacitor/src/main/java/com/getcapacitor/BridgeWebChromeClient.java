package com.getcapacitor;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import com.getcapacitor.plugin.camera.CameraUtils;

import org.apache.cordova.CordovaPlugin;

import java.util.Arrays;
import java.util.List;

/**
 * Custom WebChromeClient handler, required for showing dialogs, confirms, etc. in our
 * WebView instance.
 */
public class BridgeWebChromeClient extends WebChromeClient {
  private Bridge bridge;
  static final int FILE_CHOOSER = PluginRequestCodes.FILE_CHOOSER;
  static final int FILE_CHOOSER_IMAGE_CAPTURE = PluginRequestCodes.FILE_CHOOSER_IMAGE_CAPTURE;
  static final int FILE_CHOOSER_VIDEO_CAPTURE = PluginRequestCodes.FILE_CHOOSER_VIDEO_CAPTURE;

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
    List<String> acceptTypes = Arrays.asList(fileChooserParams.getAcceptTypes());
    boolean captureEnabled = fileChooserParams.isCaptureEnabled();
    boolean capturePhoto = captureEnabled && acceptTypes.contains("image/*");
    boolean captureVideo = captureEnabled && acceptTypes.contains("video/*");

    if ((capturePhoto || captureVideo) && isMediaCaptureSupported()) {
      boolean didShowMediaCapturePicker = showMediaCapturePicker(filePathCallback, captureVideo);
      if (!didShowMediaCapturePicker) {
        Log.w(LogUtils.getCoreTag("FileChooser"), "Media capture intent could not be launched. Falling back to default file picker.");
        showFilePicker(filePathCallback, fileChooserParams);
      }
    } else {
      showFilePicker(filePathCallback, fileChooserParams);
    }

    return true;
  }

  private boolean isMediaCaptureSupported() {
    // Launching the camera while the app has defined the "android.permission.CAMERA" in the
    // manifest file will crash the app if the permission hasn't been granted.
    //
    // More info: https://developer.android.com/reference/android/provider/MediaStore#ACTION_IMAGE_CAPTURE
    //            https://stackoverflow.com/q/32789027
    Plugin camera = bridge.getPlugin("Camera").getInstance();
    boolean isSupported = camera.hasPermission(Manifest.permission.CAMERA) || !camera.hasDefinedPermission(Manifest.permission.CAMERA);
    if (!isSupported) {
      Log.w(LogUtils.getCoreTag("FileChooser"), "Unable to launch media capture: android.permission.CAMERA was defined in the manifest but hasn't been granted.");
    }
    return isSupported;
  }

  private boolean showMediaCapturePicker(ValueCallback<Uri[]> filePathCallback, boolean isVideo) {
    // TODO: add support for video capture on Android M and older
    // On Android M and lower the VIDEO_CAPTURE_INTENT (e.g.: intent.getData())
    // returns a file:// URI instead of the expected content:// URI.
    // So we disable it for now because it requires a bit more work
    boolean isVideoCaptureSupported = android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N;

    if (isVideo && isVideoCaptureSupported) {
      return showVideoCapturePicker(filePathCallback);
    } else {
      return showImageCapturePicker(filePathCallback);
    }
  }

  private boolean showImageCapturePicker(final ValueCallback<Uri[]> filePathCallback) {
    Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    if (takePictureIntent.resolveActivity(bridge.getActivity().getPackageManager()) == null) {
      return false;
    }

    final Uri imageFileUri;
    try {
      imageFileUri = CameraUtils.createImageFileUri(bridge.getActivity(), bridge.getContext().getPackageName());
    } catch (Exception ex) {
      Log.e(LogUtils.getCoreTag(), "Unable to create temporary media capture file: " + ex.getMessage());
      return false;
    }
    takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, imageFileUri);

    bridge.cordovaInterface.startActivityForResult(new CordovaPlugin() {
      @Override
      public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        Uri[] result = null;
        if (resultCode == Activity.RESULT_OK) {
          result = new Uri[]{imageFileUri};
        }
        filePathCallback.onReceiveValue(result);
      }
    }, takePictureIntent, FILE_CHOOSER_IMAGE_CAPTURE);

    return true;
  }

  private boolean showVideoCapturePicker(final ValueCallback<Uri[]> filePathCallback) {
    Intent takeVideoIntent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
    if (takeVideoIntent.resolveActivity(bridge.getActivity().getPackageManager()) == null) {
      return false;
    }

    bridge.cordovaInterface.startActivityForResult(new CordovaPlugin() {
      @Override
      public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        Uri[] result = null;
        if (resultCode == Activity.RESULT_OK) {
          result = new Uri[]{intent.getData()};
        }
        filePathCallback.onReceiveValue(result);
      }
    }, takeVideoIntent, FILE_CHOOSER_VIDEO_CAPTURE);

    return true;
  }

  private void showFilePicker(final ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
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
  }

  @Override
  public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
    return true;
  }
}
