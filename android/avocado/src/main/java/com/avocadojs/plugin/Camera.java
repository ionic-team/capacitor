package com.avocadojs.plugin;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.content.FileProvider;
import android.util.Base64;

import com.avocadojs.JSObject;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;
import com.avocadojs.PluginRequestCodes;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;

/**
 * Camera plugin that opens the stock Camera app.
 * Adapted from https://developer.android.com/training/camera/photobasics.html
 */
@NativePlugin(
    requestCodes={Camera.REQUEST_IMAGE_CAPTURE}
)
public class Camera extends Plugin {
  // Request codes
  static final int REQUEST_IMAGE_CAPTURE = PluginRequestCodes.CAMERA_IMAGE_CAPTURE;

  // Message constants
  private static final String INVALID_RESULT_TYPE_ERROR = "Invalid resultType option";
  private static final String PERMISSION_DENIED_ERROR = "Unable to access camera, user denied permission request";
  private static final String NO_CAMERA_ERROR = "Device doesn't have a camera available";
  private static final String NO_CAMERA_ACTIVITY_ERROR = "Unable to resolve camera activity";
  private static final String IMAGE_FILE_SAVE_ERROR = "Unable to create photo on disk";
  private static final String IMAGE_PROCESS_NO_FILE_ERROR = "Unable to process image, file not found on disk";

  // Default values
  private static final boolean DEFAULT_SAVE_IMAGE_TO_GALLERY = true;

  // Valid result types
  private static final String RESULT_BASE64 = "base64";
  private static final String RESULT_URI = "uri";
  private static final String[] VALID_RESULT_TYPES = { RESULT_BASE64, RESULT_URI };

  private PluginCall lastCall;

  private String imageFileSavePath;

  @PluginMethod()
  public void getPhoto(PluginCall call) {
    lastCall = call;

    String resultType = getResultType(call.getString("resultType"));
    boolean saveToGallery = call.getBoolean("saveToGallery", DEFAULT_SAVE_IMAGE_TO_GALLERY);

    if(resultType == null || Arrays.asList(VALID_RESULT_TYPES).indexOf(resultType) < 0) {
      call.error(INVALID_RESULT_TYPE_ERROR);
      return;
    }

    if(!getActivity().getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA)) {
      call.error(NO_CAMERA_ERROR);
      return;
    }

    // If we want to save to the gallery, we need two permissions
    if(saveToGallery && !(hasPermission(Manifest.permission.CAMERA) && hasPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE))) {
      pluginRequestPermissions(new String[]{
          Manifest.permission.CAMERA,
          Manifest.permission.WRITE_EXTERNAL_STORAGE,
          Manifest.permission.READ_EXTERNAL_STORAGE
      }, REQUEST_IMAGE_CAPTURE);
    }
    // If we don't need to save to the gallery, we can just ask for camera permissions
    else if(!hasPermission(Manifest.permission.CAMERA)) {
      pluginRequestPermission(Manifest.permission.CAMERA, REQUEST_IMAGE_CAPTURE);
    }

    // We have all necessary permissions, open the camera
    else {
      openCamera(call);
    }
  }

  private String getResultType(String resultType) {
    if(resultType == null) { return null; }
    return resultType.toLowerCase();
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

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);

    if(requestCode == REQUEST_IMAGE_CAPTURE) {
      processImage(lastCall, data);
    }
  }

  public void openCamera(PluginCall call) {
    boolean saveToGallery = call.getBoolean("saveToGallery", DEFAULT_SAVE_IMAGE_TO_GALLERY);

    Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    if (takePictureIntent.resolveActivity(getActivity().getPackageManager()) != null) {
      // If we will be saving the photo, send the target file along
      try {
        String appId = getAppId();
        File photoFile = createImageFile(saveToGallery);
        imageFileSavePath = photoFile.getAbsolutePath();
        // TODO: Verify provider config exists
        Uri photoURI = FileProvider.getUriForFile(getActivity(), appId + ".fileprovider", photoFile);
        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
      } catch (Exception ex) {
        call.error(IMAGE_FILE_SAVE_ERROR, ex);
        return;
      }

      getActivity().startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
    } else {
      call.error(NO_CAMERA_ACTIVITY_ERROR);
    }
  }

  public void processImage(PluginCall call, Intent data) {
    boolean allowEditing = call.getBoolean("allowEditing", false);
    boolean saveToGallery = call.getBoolean("saveToGallery", DEFAULT_SAVE_IMAGE_TO_GALLERY);
    String resultType = getResultType(call.getString("resultType"));

    if(imageFileSavePath == null) {
      call.error(IMAGE_PROCESS_NO_FILE_ERROR);
      return;
    }

    log("Processing image");
    if(saveToGallery) {
      log("Saving image to gallery");
      Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
      File f = new File(imageFileSavePath);
      Uri contentUri = Uri.fromFile(f);
      mediaScanIntent.setData(contentUri);
      getActivity().sendBroadcast(mediaScanIntent);
    }

    if(resultType.equals(RESULT_BASE64)) {
      log("Returning base64 value");
      File f = new File(imageFileSavePath);
      BitmapFactory.Options bmOptions = new BitmapFactory.Options();
      Uri contentUri = Uri.fromFile(f);
      Bitmap bitmap = BitmapFactory.decodeFile(imageFileSavePath, bmOptions);
      
      returnBase64(call, bitmap);
    }
  }

  private void returnBase64(PluginCall call, Bitmap bitmap) {
    int quality = call.getInt("quality", 100);
    ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
    bitmap.compress(Bitmap.CompressFormat.JPEG, quality, byteArrayOutputStream);
    byte[] byteArray = byteArrayOutputStream .toByteArray();
    String encoded = Base64.encodeToString(byteArray, Base64.DEFAULT);

    JSObject data = new JSObject();
    data.put("base64_data", encoded);
    call.success(data);
  }

  private File createImageFile(boolean saveToGallery) throws IOException {
    // Create an image file name
    String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
    String imageFileName = "JPEG_" + timeStamp + "_";
    File storageDir;
    if(saveToGallery) {
      log("Trying to save image to public external directory");
      storageDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);
    }  else {
      storageDir = getActivity().getExternalFilesDir(Environment.DIRECTORY_PICTURES);
    }

    File image = File.createTempFile(
        imageFileName,  /* prefix */
        ".jpg",         /* suffix */
        storageDir      /* directory */
    );

    return image;
  }
}
