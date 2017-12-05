package com.avocadojs.plugin;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.MediaStore;
import android.util.Log;

import com.avocadojs.Bridge;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

/**
 * Camera plugin that opens the stock Camera app.
 * https://developer.android.com/training/camera/photobasics.html
 */
@NativePlugin(
    id="com.avocadojs.plugin.camera",
    requestCodes={Camera.REQUEST_IMAGE_CAPTURE}
)
public class Camera extends Plugin {
  static final int REQUEST_IMAGE_CAPTURE = 9001;

  private static final String PERMISSION_DENIED_ERROR = "Unable to access camera, user denied permission request";
  private static final String NO_CAMERA_ERROR = "Device doesn't have a camera available";
  private static final String NO_CAMERA_ACTIVITY_ERROR = "Unable to resolve camera activity";

  private PluginCall lastCall;

  @PluginMethod()
  public void getPhoto(PluginCall call) {
    int quality = call.getInt("quality", 100);
    boolean allowEditing = call.getBoolean("allowEditing", false);

    lastCall = call;

    if(!getActivity().getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA)) {
      call.error(NO_CAMERA_ERROR);
      return;
    }


    if(!hasPermission(Manifest.permission.CAMERA)) {
      log("Missing camera permission");
      requestPermission(Manifest.permission.CAMERA, REQUEST_IMAGE_CAPTURE);
      return;
    }

    openCamera(call);
  }

  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    log("handling request perms result");

    if(lastCall == null) {
      log("No stored plugin call for permissions request result");
      return;
    }

    for(int result : grantResults) {
      if(result == PackageManager.PERMISSION_DENIED) {
        this.lastCall.error(PERMISSION_DENIED_ERROR);
        return;
      }
    }

    if(requestCode == REQUEST_IMAGE_CAPTURE) {
      openCamera(lastCall);
    }
  }

  public void openCamera(PluginCall call) {
    log("Opening camera");

    Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    if (takePictureIntent.resolveActivity(getActivity().getPackageManager()) != null) {
      getActivity().startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
    } else {
      call.error(NO_CAMERA_ACTIVITY_ERROR);
    }
  }
}
