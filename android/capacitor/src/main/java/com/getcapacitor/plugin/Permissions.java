package com.getcapacitor.plugin;

import android.Manifest;
import android.content.pm.PackageManager;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v4.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import org.json.JSONArray;

@NativePlugin()
public class Permissions extends Plugin {

  @PluginMethod
  public void hasPermission(PluginCall call) {
    String type = call.getString("type");

    switch (type) {
      case "CAMERA":
        checkCamera(call);
        break;
      case "PHOTOS":
        checkPhotos(call);
        break;
      case "GEOLOCATION":
        checkGeo(call);
        break;
      case "PUSH_NOTIFICATIONS":
        checkPushNotifications(call);
        break;
      case "CLIPBOARD":
        checkClipboard(call);
        break;
      default:
        call.reject("Unknown permission type");
    }
  }

  private void checkPerm(String perm, PluginCall call) {
    JSObject ret = new JSObject();
    if (ContextCompat.checkSelfPermission(getContext(), perm) == PackageManager.PERMISSION_GRANTED) {
      ret.put("value", true);
    } else {
      ret.put("value", false);
    }
    call.resolve(ret);
  }

  private void checkCamera(PluginCall call) {
    checkPerm(Manifest.permission.CAMERA, call);
  }

  private void checkPhotos(PluginCall call) {
    checkPerm(Manifest.permission.READ_EXTERNAL_STORAGE, call);
  }

  private void checkGeo(PluginCall call) {
    checkPerm(Manifest.permission.ACCESS_COARSE_LOCATION, call);
  }

  private void checkPushNotifications(PluginCall call) {
    boolean areEnabled = NotificationManagerCompat.from(getContext()).areNotificationsEnabled();
    JSObject ret = new JSObject();
    ret.put("value", areEnabled);
    call.resolve(ret);
  }

  private void checkClipboard(PluginCall call) {
    JSObject ret = new JSObject();
    ret.put("value", true);
    call.resolve(ret);
  }

}
