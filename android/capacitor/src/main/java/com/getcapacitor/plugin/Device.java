package com.getcapacitor.plugin;

import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.os.BatteryManager;
import android.os.Environment;
import android.os.StatFs;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import java.util.Locale;


@NativePlugin()
public class Device extends Plugin {

  @PluginMethod()
  public void getInfo(PluginCall call) {
    JSObject r = new JSObject();

    r.put("memUsed", getMemUsed());
    r.put("diskFree", getDiskFree());
    r.put("diskTotal", getDiskTotal());
    r.put("model", android.os.Build.MODEL);
    r.put("operatingSystem", "android");
    r.put("osVersion", android.os.Build.VERSION.RELEASE);
    r.put("appVersion", getAppVersion());
    r.put("appBuild", getAppBuild());
    r.put("platform", getPlatform());
    r.put("manufacturer", android.os.Build.MANUFACTURER);
    r.put("uuid", getUuid());
    r.put("batteryLevel", getBatteryLevel());
    r.put("isCharging", isCharging());
    r.put("isVirtual", isVirtual());

    call.success(r);
  }

  @PluginMethod()
  public void getLanguageCode(PluginCall call) {
    JSObject ret = new JSObject();
    ret.put("value", Locale.getDefault().getLanguage());
    call.success(ret);
  }

  private long getMemUsed() {
    final Runtime runtime = Runtime.getRuntime();
    final long usedMem = (runtime.totalMemory() - runtime.freeMemory());
    return usedMem;
  }

  private long getDiskFree() {
    StatFs statFs = new StatFs(Environment.getRootDirectory().getAbsolutePath());
    return statFs.getAvailableBlocksLong() * statFs.getBlockSizeLong();
  }

  private long getDiskTotal() {
    StatFs statFs = new StatFs(Environment.getRootDirectory().getAbsolutePath());
    return statFs.getBlockCountLong() * statFs.getBlockSizeLong();
  }

  private String getAppVersion() {
    try {
      PackageInfo pinfo = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
      return pinfo.versionName;
    } catch(Exception ex) {
      return "";
    }
  }

  private String getAppBuild() {
    try {
      PackageInfo pinfo = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
      return Integer.toString(pinfo.versionCode);
    } catch(Exception ex) {
      return "";
    }
  }

  private String getPlatform() {
    return "android";
  }

  private String getUuid() {
    return Settings.Secure.getString(this.bridge.getContext().getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
  }

  private float getBatteryLevel() {
    IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
    Intent batteryStatus = getContext().registerReceiver(null, ifilter);

    int level = -1;
    int scale = -1;

    if (batteryStatus != null) {
      level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
      scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
    }

    return level / (float) scale;
  }

  private boolean isCharging() {
    IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
    Intent batteryStatus = getContext().registerReceiver(null, ifilter);

    if (batteryStatus != null) {
      int status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
      return status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL;
    }
    return false;
  }

  private boolean isVirtual() {
    return android.os.Build.FINGERPRINT.contains("generic") || android.os.Build.PRODUCT.contains("sdk");
  }

}
