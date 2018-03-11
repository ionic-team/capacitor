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
import com.getcapacitor.Dialogs;
import com.getcapacitor.ImageUtils;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;

enum CameraSource {
  PROMPT("PROMPT"),
  CAMERA("CAMERA"),
  PHOTOS("PHOTOS");
  private String source;
  CameraSource(String source) {
    this.source = source;
  }
  public String getSource() { return this.source; }
}

enum CameraResultType {
  BASE64("base64"),
  URI("uri");
  private String type;
  CameraResultType(String type) {
    this.type = type;
  }
}

class CameraSettings {
  CameraResultType resultType = CameraResultType.BASE64;
  int quality = 100;
  boolean shouldResize = false;
  boolean shouldCorrectOrientation = Camera.DEFAULT_CORRECT_ORIENTATION;
  boolean saveToGallery = Camera.DEFAULT_SAVE_IMAGE_TO_GALLERY;
  int width = 0;
  int height = 0;
  CameraSource source = CameraSource.PROMPT;
}

/**
 * The Camera plugin makes it easy to take a photo or have the user select a photo
 * from their albums.
 *
 * On Android, this plugin sends an intent that opens the stock Camera app.
 *
 * Adapted from https://developer.android.com/training/camera/photobasics.html
 */
@NativePlugin(
    requestCodes={Camera.REQUEST_IMAGE_CAPTURE, Camera.REQUEST_IMAGE_PICK}
)
public class Camera extends Plugin {
  // Request codes
  static final int REQUEST_IMAGE_CAPTURE = PluginRequestCodes.CAMERA_IMAGE_CAPTURE;
  static final int REQUEST_IMAGE_PICK = PluginRequestCodes.CAMERA_IMAGE_PICK;

  // Message constants
  private static final String INVALID_RESULT_TYPE_ERROR = "Invalid resultType option";
  private static final String PERMISSION_DENIED_ERROR = "Unable to access camera, user denied permission request";
  private static final String NO_CAMERA_ERROR = "Device doesn't have a camera available";
  private static final String NO_CAMERA_ACTIVITY_ERROR = "Unable to resolve camera activity";
  private static final String IMAGE_FILE_SAVE_ERROR = "Unable to create photo on disk";
  private static final String IMAGE_PROCESS_NO_FILE_ERROR = "Unable to process image, file not found on disk";

  // Default values
  private static final int DEFAULT_QUALITY = 100;
  protected static final boolean DEFAULT_SAVE_IMAGE_TO_GALLERY = true;
  protected static final boolean DEFAULT_CORRECT_ORIENTATION = false;

  private String imageFileSavePath;

  private CameraSettings settings = new CameraSettings();

  @PluginMethod()
  public void getPhoto(PluginCall call) {
    saveCall(call);

    settings = getSettings(call);

    doShow(call);
  }

  private void doShow(PluginCall call) {
    switch (settings.source) {
      case PROMPT:
        showPrompt(call);
        break;
      case CAMERA:
        showCamera(call);
        break;
      case PHOTOS:
        showPhotos(call);
        break;
    }
  }

  private void showPrompt(final PluginCall call) {
    if (checkPermissions (call)) {

      // We have all necessary permissions, open the camera
      JSObject fromPhotos = new JSObject();
      fromPhotos.put("title", "From Photos");
      JSObject takePicture = new JSObject();
      takePicture.put("title", "Take Picture");
      Object[] options = new Object[] {
        fromPhotos,
        takePicture
      };

      Dialogs.actions(getActivity(), options, new Dialogs.OnSelectListener() {
        @Override
        public void onSelect(int index) {
          if (index == 0) {
            openPhotos(call);
          } else if (index == 1) {
            openCamera(call);
          }
        }
      });
    }
  }

  private void showCamera(final PluginCall call) {
    if(!getActivity().getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA)) {
      call.error(NO_CAMERA_ERROR);
      return;
    }
    openCamera(call);
  }

  private void showPhotos(final PluginCall call) {
    openPhotos(call);
  }

  private boolean checkPermissions(PluginCall call) {
    // If we want to save to the gallery, we need two permissions
    if(settings.saveToGallery && !(hasPermission(Manifest.permission.CAMERA) && hasPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE))) {
      pluginRequestPermissions(new String[]{
        Manifest.permission.CAMERA,
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.READ_EXTERNAL_STORAGE
      }, REQUEST_IMAGE_CAPTURE);
      return false;
    }
    // If we don't need to save to the gallery, we can just ask for camera permissions
    else if(!hasPermission(Manifest.permission.CAMERA)) {
      pluginRequestPermission(Manifest.permission.CAMERA, REQUEST_IMAGE_CAPTURE);
      return false;
    }

    return true;
  }

  private CameraSettings getSettings(PluginCall call) {
    CameraSettings settings = new CameraSettings();
    settings.resultType = getResultType(call.getString("resultType"));
    settings.saveToGallery = call.getBoolean("saveToGallery", DEFAULT_SAVE_IMAGE_TO_GALLERY);
    settings.quality = call.getInt("quality", DEFAULT_QUALITY);
    settings.width = call.getInt("width", 0);
    settings.height = call.getInt("height", 0);
    settings.shouldResize = settings.width > 0 || settings.height > 0;
    settings.shouldCorrectOrientation = call.getBoolean("correctOrientation", DEFAULT_CORRECT_ORIENTATION);
    try {
      settings.source = CameraSource.valueOf(call.getString("source", CameraSource.PROMPT.getSource()));
    } catch (IllegalArgumentException ex) {
      settings.source = CameraSource.PROMPT;
    }
    return settings;
  }

  private CameraResultType getResultType(String resultType) {
    if (resultType == null) { return null; }
    try {
      return CameraResultType.valueOf(resultType.toUpperCase());
    } catch (IllegalArgumentException ex) {
      log("Invalid result type \"" + resultType + "\", defaulting to base64");
      return CameraResultType.BASE64;
    }
  }

  public void openCamera(final PluginCall call) {
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

  public void openPhotos(final PluginCall call) {
    Intent intent = new Intent(Intent.ACTION_PICK);
    intent.setType("image/*");
    startActivityForResult(call, intent, REQUEST_IMAGE_PICK);
  }

  public void processCameraImage(PluginCall call, Intent data) {
    boolean allowEditing = call.getBoolean("allowEditing", false);
    boolean saveToGallery = call.getBoolean("saveToGallery", DEFAULT_SAVE_IMAGE_TO_GALLERY);
    CameraResultType resultType = getResultType(call.getString("resultType"));

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

    bitmap = prepareBitmap(bitmap);

    // Compress the final image and prepare for output to client
    ByteArrayOutputStream bitmapOutputStream = new ByteArrayOutputStream();
    bitmap.compress(Bitmap.CompressFormat.JPEG, settings.quality, bitmapOutputStream);

    if (resultType == CameraResultType.BASE64) {
      returnBase64(call, bitmapOutputStream);
    } else if (resultType == CameraResultType.URI) {
      JSObject ret = new JSObject();
      ret.put("path", contentUri.toString());
      call.success(ret);
    }
  }

  public void processPickedImage(PluginCall call, Intent data) {
    if (data == null) {
      call.error("No image picked");
      return;
    }

    Uri u = data.getData();

    try {
      InputStream imageStream = getActivity().getContentResolver().openInputStream(u);
      Bitmap bitmap = BitmapFactory.decodeStream(imageStream);

      int orientation = ExifInterface.ORIENTATION_NORMAL;
      bitmap = prepareBitmap(bitmap);

      // Compress the final image and prepare for output to client
      ByteArrayOutputStream bitmapOutputStream = new ByteArrayOutputStream();
      bitmap.compress(Bitmap.CompressFormat.JPEG, settings.quality, bitmapOutputStream);

      if (settings.resultType == CameraResultType.BASE64) {
        returnBase64(call, bitmapOutputStream);
      } else if (settings.resultType == CameraResultType.URI) {
        JSObject ret = new JSObject();
        ret.put("path", u.toString());
        call.success(ret);
      }
    } catch (FileNotFoundException ex) {
      call.error("No such image found", ex);
    }
  }

  /**
   * Apply our standard processing of the bitmap, returning a new one and
   * recycling the old one in the process
   * @param bitmap
   * @return
   */
  private Bitmap prepareBitmap(Bitmap bitmap) {
    if (settings.shouldCorrectOrientation) {
      Bitmap newBitmap = ImageUtils.correctOrientation(bitmap, imageFileSavePath);
      if (bitmap != newBitmap) {
        bitmap.recycle();
      }
      bitmap = newBitmap;
    }

    if (settings.shouldResize) {
      Bitmap newBitmap = ImageUtils.resize(bitmap, settings.width, settings.height);
      if (bitmap != newBitmap) {
        bitmap.recycle();
      }
      bitmap = newBitmap;
    }
    return bitmap;
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

    if (savedCall == null) {
      return;
    }

    if (requestCode == REQUEST_IMAGE_CAPTURE) {
      processCameraImage(savedCall, data);
    } else if (requestCode == REQUEST_IMAGE_PICK) {
      processPickedImage(savedCall, data);
    }
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
