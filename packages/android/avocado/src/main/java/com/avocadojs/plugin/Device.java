package com.avocadojs.plugin;

import android.Manifest;
import android.content.pm.PackageManager;
import android.provider.Settings;
import android.support.v4.app.ActivityCompat;

import com.avocadojs.Bridge;
import com.avocadojs.Plugin;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;
import com.avocadojs.PluginResult;


@Plugin(id="com.avocadojs.plugin.device")
public class Device extends PluginBase {

  @PluginMethod()
  public void getInfo(PluginCall call) {
    PluginResult r = new PluginResult();

    r.put("uuid", this.getUuid());
    r.put("version", android.os.Build.VERSION.RELEASE);
    r.put("platform", this.getPlatform());
    r.put("model", android.os.Build.MODEL);
    r.put("manufacturer", android.os.Build.MANUFACTURER);
    r.put("isVirtual", this.isVirtual());

    // Get the device serial if the user granted permissions for it
    if (ActivityCompat.checkSelfPermission(this.bridge.getContext(), Manifest.permission.READ_PHONE_STATE)
        == PackageManager.PERMISSION_GRANTED) {
      r.put("serial", android.os.Build.getSerial());
    }

    call.successCallback(r);
  }

  private String getPlatform() {
    if (android.os.Build.MANUFACTURER.equals("Amazon")) {
      return "amazon-fireos";
    }
    return "Android";
  }

  private String getUuid() {
    // TODO: This isn't recommended, review it
    return Settings.Secure.getString(this.bridge.getContext().getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
  }

  private boolean isVirtual() {
    return android.os.Build.FINGERPRINT.contains("generic") || android.os.Build.PRODUCT.contains("sdk");
  }

}
