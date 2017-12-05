package com.avocadojs.plugin;

import android.Manifest;
import android.content.Intent;
import android.provider.MediaStore;
import android.util.Log;

import com.avocadojs.Bridge;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@NativePlugin(id="com.avocadojs.plugin.camera")
public class Camera extends Plugin {
  static final int REQUEST_IMAGE_CAPTURE = 1;

  @PluginMethod()
  public void getPhoto(PluginCall call) {
    int quality = call.getInt("quality", 100).intValue();
    boolean allowEditing = call.getBoolean("allowEditing", false).booleanValue();

    if(!hasPermission(Manifest.permission.CAMERA)) {
      Log.d(Bridge.TAG, "Missing camera permission");
      this.requestPermission(Manifest.permission.CAMERA);
      return;
    }

    Log.d(Bridge.TAG, "Taking photo");

    Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    if (takePictureIntent.resolveActivity(getActivity().getPackageManager()) != null) {
      getActivity().startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
    }
  }

}
