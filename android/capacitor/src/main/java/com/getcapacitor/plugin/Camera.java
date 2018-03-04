package com.getcapacitor.plugin;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.content.FileProvider;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.ImageUtils;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;

/**
 * The Camera plugin makes it easy to take a photo or have the user select a photo
 * from their albums.
 *
 * On Android, this plugin sends an intent that opens the stock Camera app.
 *
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
  private static final int DEFAULT_QUALITY = 100;
  private static final boolean DEFAULT_SAVE_IMAGE_TO_GALLERY = true;
  private static final boolean DEFAULT_CORRECT_ORIENTATION = false;

  // Valid result types
  private static final String RESULT_BASE64 = "base64";
  private static final String RESULT_URI = "uri";
  private static final String[] VALID_RESULT_TYPES = { RESULT_BASE64, RESULT_URI };

  private String imageFileSavePath;
  private int quality = 100;
  private boolean shouldResize = false;
  private boolean shouldCorrectOrientation = false;
  private int width = 0;
  private int height = 0;

  @PluginMethod()
  public void getPhoto(PluginCall call) {
    saveCall(call);

    String resultType = getResultType(call.getString("resultType"));
    boolean saveToGallery = call.getBoolean("saveToGallery", DEFAULT_SAVE_IMAGE_TO_GALLERY);
    quality = call.getInt("quality", DEFAULT_QUALITY);
    width = call.getInt("width", 0);
    height = call.getInt("height", 0);
    shouldResize = width > 0 || height > 0;
    shouldCorrectOrientation = call.getBoolean("correctOrientation", DEFAULT_CORRECT_ORIENTATION);

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
    if (resultType == null) { return null; }
    return resultType.toLowerCase();
  }

  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    log("handling request perms result");

    if (getSavedCall() == null) {
      log("No stored plugin call for permissions request result");
      return;
    }

    PluginCall savedCall = getSavedCall();

    for (int result : grantResults) {
      if(result == PackageManager.PERMISSION_DENIED) {
        savedCall.error(PERMISSION_DENIED_ERROR);
        return;
      }
    }

    if (requestCode == REQUEST_IMAGE_CAPTURE) {
      openCamera(savedCall);
    }
  }

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);

    PluginCall savedCall = getSavedCall();

    if (requestCode == REQUEST_IMAGE_CAPTURE && savedCall != null) {
      processImage(savedCall, data);
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

      startActivityForResult(call, takePictureIntent, REQUEST_IMAGE_CAPTURE);
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

    if (saveToGallery) {
      Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
      File f = new File(imageFileSavePath);
      Uri contentUri = Uri.fromFile(f);
      mediaScanIntent.setData(contentUri);
      getActivity().sendBroadcast(mediaScanIntent);
    }

    // Load the image as a Bitmap
    File f = new File(imageFileSavePath);
    BitmapFactory.Options bmOptions = new BitmapFactory.Options();
    Uri contentUri = Uri.fromFile(f);
    Bitmap bitmap = BitmapFactory.decodeFile(imageFileSavePath, bmOptions);
    int orientation = ExifInterface.ORIENTATION_NORMAL;

    if (bitmap == null) {
      call.error("User cancelled photos app");
      return;
    }

    if (shouldCorrectOrientation) {
      Bitmap newBitmap = ImageUtils.correctOrientation(bitmap, imageFileSavePath);
      if (bitmap != newBitmap) {
        bitmap.recycle();
      }
      bitmap = newBitmap;
    }

    if (shouldResize) {
      Bitmap newBitmap = ImageUtils.resize(bitmap, width, height);
      if (bitmap != newBitmap) {
        bitmap.recycle();
      }
      bitmap = newBitmap;
    }

    // Compress the final image and prepare for output to client
    ByteArrayOutputStream bitmapOutputStream = new ByteArrayOutputStream();
    bitmap.compress(Bitmap.CompressFormat.JPEG, quality, bitmapOutputStream);

    if (resultType.equals(RESULT_BASE64)) {
      returnBase64(call, bitmapOutputStream);
    } else if (resultType.equals(RESULT_URI)) {
      JSObject ret = new JSObject();
      ret.put("path", contentUri.toString());
      call.success(ret);
    }
  }

  private void returnBase64(PluginCall call, ByteArrayOutputStream bitmapOutputStream) {
    byte[] byteArray = bitmapOutputStream.toByteArray();
    String encoded = Base64.encodeToString(byteArray, Base64.DEFAULT);

    JSObject data = new JSObject();
    data.put("base64_data", "data:image/jpeg;base64," + encoded);
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


  @Override
  protected Bundle saveInstanceState() {
    Bundle bundle = super.saveInstanceState();
    bundle.putString("cameraImageFileSavePath", imageFileSavePath);
    return bundle;
  }

  @Override
  protected void restoreState(Bundle state) {
    String storedImageFileSavePath = state.getString("cameraImageFileSavePath");
    if (storedImageFileSavePath != null) {
      imageFileSavePath = storedImageFileSavePath;
    }
  }

}
