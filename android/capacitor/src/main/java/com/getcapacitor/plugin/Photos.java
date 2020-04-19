package com.getcapacitor.plugin;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;
import java.io.IOException;
import java.io.OutputStream;

@NativePlugin(
        permissions = {Manifest.permission.WRITE_EXTERNAL_STORAGE},
        requestCodes = {PluginRequestCodes.PHOTOS_REQUEST_WRITE_FILE_PERMISSIONS},
        permissionRequestCode = PluginRequestCodes.PHOTOS_REQUEST_WRITE_FILE_PERMISSIONS
)
public class Photos extends Plugin {

  @PluginMethod()
  public void getAlbums(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void getPhotos(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void createAlbum(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void savePhoto(PluginCall call) {
    saveCall(call);

    if (!hasPhotosPermissions()) {
      return;
    }

    String data = removeBase64DataUri(call.getString("data", ""));

    if (data.isEmpty()) {
      call.error("Data field cannot be empty");
      return;
    }

    ContentValues contentValues = new ContentValues();
    contentValues.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
    contentValues.put(MediaStore.Images.Media.DATE_ADDED, System.currentTimeMillis());

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      contentValues.put(MediaStore.Images.Media.DATE_TAKEN, System.currentTimeMillis());
      contentValues.put(MediaStore.MediaColumns.IS_PENDING, 1);
    }

    ContentResolver resolver = getActivity().getContentResolver();
    Uri imageUri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues);

    try (OutputStream fos = getActivity().getContentResolver().openOutputStream(imageUri)) {
      fos.write(Base64.decode(data, Base64.NO_WRAP));
    } catch (IOException e) {
      resolver.delete(imageUri, null, null);
      call.error("Cannot create image file");
    } finally {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0);
      }
    }

    call.success();
  }

  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    PluginCall savedCall = getSavedCall();

    if (savedCall == null) {
      savedCall.error("Unable to perform operation. Cannot retrieve saved call");
      return;
    }

    if (someDenied(grantResults)) {
      savedCall.error("Unable to access external storage, user denied permission request");
      return;
    }

    if (requestCode == PluginRequestCodes.PHOTOS_REQUEST_WRITE_FILE_PERMISSIONS) {
      savePhoto(savedCall);
    }
  }

  private boolean hasPhotosPermissions() {
    String permission = Manifest.permission.WRITE_EXTERNAL_STORAGE;

    if (hasPermission(permission)) {
      Log.v(getLogTag(), String.format("Permission '%s' is granted", permission));
      return true;
    }

    Log.v(getLogTag(), String.format("Permission '%s' denied. Asking user for it.", permission));
    pluginRequestPermission(permission, PluginRequestCodes.PHOTOS_REQUEST_WRITE_FILE_PERMISSIONS);
    return false;
  }

  private String removeBase64DataUri(String data) {
    return data.startsWith("data:") ? data.substring(data.indexOf(",") + 1) : data;
  }

  private boolean someDenied(int[] list) {
    for (int e : list) {
      if (e == PackageManager.PERMISSION_DENIED) {
        return true;
      }
    }

    return false;
  }
}
