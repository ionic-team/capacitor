package com.getcapacitor;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.MediaStore;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.MimeTypeMap;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.view.View;

import com.getcapacitor.plugin.camera.CameraUtils;

import org.apache.cordova.CordovaPlugin;
import org.json.JSONException;

import java.util.ArrayList;
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
  static final int FILE_CHOOSER_CAMERA_PERMISSION = PluginRequestCodes.FILE_CHOOSER_CAMERA_PERMISSION;
  static final int GET_USER_MEDIA_PERMISSIONS = PluginRequestCodes.GET_USER_MEDIA_PERMISSIONS;

  public BridgeWebChromeClient(Bridge bridge) {
    this.bridge = bridge;
  }
  
  @Override
  public void onShowCustomView(View view, CustomViewCallback callback) {
    callback.onCustomViewHidden();
    super.onShowCustomView(view, callback);
  }
  
  @Override
  public void onHideCustomView() {
    super.onHideCustomView();
  }

  @Override
  public void onPermissionRequest(final PermissionRequest request) {
    boolean isRequestPermissionRequired = android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M;

    List<String> permissionList = new ArrayList<String>();
    if (Arrays.asList(request.getResources()).contains("android.webkit.resource.VIDEO_CAPTURE")) {
      permissionList.add(Manifest.permission.CAMERA);
    }
    if (Arrays.asList(request.getResources()).contains("android.webkit.resource.AUDIO_CAPTURE")) {
      permissionList.add(Manifest.permission.MODIFY_AUDIO_SETTINGS);
      permissionList.add(Manifest.permission.RECORD_AUDIO);
    }
    if (!permissionList.isEmpty() && isRequestPermissionRequired) {
      String [] permissions = permissionList.toArray(new String[0]);;
      bridge.cordovaInterface.requestPermissions(new CordovaPlugin(){
        @Override
        public void onRequestPermissionResult(int requestCode, String[] permissions, int[] grantResults) throws JSONException {
          if (GET_USER_MEDIA_PERMISSIONS == requestCode) {
            for (int r : grantResults) {
              if (r == PackageManager.PERMISSION_DENIED) {
                request.deny();
                return;
              }
            }
            request.grant(request.getResources());
          }
        }
      }, GET_USER_MEDIA_PERMISSIONS, permissions);
    } else {
      request.grant(request.getResources());
    }
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
    Logger.debug("onGeolocationPermissionsShowPrompt: DOING IT HERE FOR ORIGIN: " + origin);

    // Set that we want geolocation perms for this origin
    callback.invoke(origin, true, false);

    Plugin geo = bridge.getPlugin("Geolocation").getInstance();
    if (!geo.hasRequiredPermissions()) {
      geo.pluginRequestAllPermissions();
    } else {
      Logger.debug("onGeolocationPermissionsShowPrompt: has required permis");
    }
  }

  @Override
  public boolean onShowFileChooser(WebView webView, final ValueCallback<Uri[]> filePathCallback, final FileChooserParams fileChooserParams) {
    List<String> acceptTypes = Arrays.asList(fileChooserParams.getAcceptTypes());
    boolean captureEnabled = fileChooserParams.isCaptureEnabled();
    boolean capturePhoto = captureEnabled && acceptTypes.contains("image/*");
    final boolean captureVideo = captureEnabled && acceptTypes.contains("video/*");
    if ((capturePhoto || captureVideo)) {
      if(isMediaCaptureSupported()) {
        showMediaCaptureOrFilePicker(filePathCallback, fileChooserParams, captureVideo);
      } else {
        this.bridge.cordovaInterface.requestPermission(new CordovaPlugin(){
          @Override
          public void onRequestPermissionResult(int requestCode, String[] permissions, int[] grantResults) throws JSONException {
            if (FILE_CHOOSER_CAMERA_PERMISSION == requestCode) {
              if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                showMediaCaptureOrFilePicker(filePathCallback, fileChooserParams, captureVideo);
              } else {
                Logger.warn(Logger.tags("FileChooser"), "Camera permission not granted");
                filePathCallback.onReceiveValue(null);
              }
            }
          }
        }, FILE_CHOOSER_CAMERA_PERMISSION, Manifest.permission.CAMERA);
      }
    } else {
      showFilePicker(filePathCallback, fileChooserParams);
    }

    return true;
  }

  private boolean isMediaCaptureSupported() {
    Plugin camera = bridge.getPlugin("Camera").getInstance();
    boolean isSupported = camera.hasPermission(Manifest.permission.CAMERA) || !camera.hasDefinedPermission(Manifest.permission.CAMERA);
    return isSupported;
  }

  private void showMediaCaptureOrFilePicker(ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams, boolean isVideo) {
    // TODO: add support for video capture on Android M and older
    // On Android M and lower the VIDEO_CAPTURE_INTENT (e.g.: intent.getData())
    // returns a file:// URI instead of the expected content:// URI.
    // So we disable it for now because it requires a bit more work
    boolean isVideoCaptureSupported = android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N;
    boolean shown = false;
    if (isVideo && isVideoCaptureSupported) {
      shown = showVideoCapturePicker(filePathCallback);
    } else {
      shown = showImageCapturePicker(filePathCallback);
    }
    if (!shown) {
      Logger.warn(Logger.tags("FileChooser"), "Media capture intent could not be launched. Falling back to default file picker.");
      showFilePicker(filePathCallback, fileChooserParams);
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
      Logger.error("Unable to create temporary media capture file: " + ex.getMessage());
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
    if (fileChooserParams.getAcceptTypes().length > 1) {
      String[] validTypes = getValidTypes(fileChooserParams.getAcceptTypes());
      intent.putExtra(Intent.EXTRA_MIME_TYPES, validTypes);
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

  private String[] getValidTypes(String[] currentTypes) {
    List<String> validTypes = new ArrayList<>();
    MimeTypeMap mtm = MimeTypeMap.getSingleton();
    for (String mime : currentTypes) {
      if (mime.startsWith(".")) {
        String extension = mime.substring(1);
        String extensionMime = mtm.getMimeTypeFromExtension(extension);
        if (extensionMime != null && !validTypes.contains(extensionMime)) {
          validTypes.add(extensionMime);
        }
      } else if (!validTypes.contains(mime)) {
        validTypes.add(mime);
      }
    }
    Object[] validObj = validTypes.toArray();
    return Arrays.copyOf(validObj, validObj.length, String[].class);
  }

  @Override
  public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
    String tag = Logger.tags("Console");
    if (consoleMessage.message() != null && isValidMsg(consoleMessage.message())) {
      String msg = String.format("File: %s - Line %d - Msg: %s" , consoleMessage.sourceId() , consoleMessage.lineNumber(), consoleMessage.message());
      String level = consoleMessage.messageLevel().name();
      if ("ERROR".equalsIgnoreCase(level)) {
        Logger.error(tag, msg, null);
      } else if ("WARNING".equalsIgnoreCase(level)) {
        Logger.warn(tag, msg);
      } else if ("TIP".equalsIgnoreCase(level)) {
        Logger.debug(tag, msg);
      } else {
        Logger.info(tag, msg);
      }
    }
    return true;
  }

  public  boolean isValidMsg(String msg) {
    return !(msg.contains("%cresult %c") || (msg.contains("%cnative %c")) || msg.equalsIgnoreCase("[object Object]") || msg.equalsIgnoreCase("console.groupEnd"));
  }
}
