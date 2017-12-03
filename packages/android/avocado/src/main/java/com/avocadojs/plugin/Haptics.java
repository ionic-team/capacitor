package com.avocadojs.plugin;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.support.v4.app.ActivityCompat;

import com.avocadojs.Plugin;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

import java.security.Permission;

/**
 * Haptic engine plugin, also handles vibration.
 *
 * If you'd like to use this plugin, add the following permissions to
 * your AndroidManifest.xml:
 * <uses-permission android:name="android.permission.VIBRATE"/>
 */
@Plugin(id="com.avocadojs.plugin.haptics")
public class Haptics extends PluginBase {
  @PluginMethod()
  public void vibrate(PluginCall call) {
    Context c = this.getContext();
    int duration = call.getInt("duration", 300).intValue();

    if(!hasPermission(Manifest.permission.VIBRATE)) {
      call.error("Can't vibrate: Missing VIBRATE permission in AndroidManifest.xml");
      return;
    }

    if (Build.VERSION.SDK_INT >= 26) {
      ((Vibrator) c.getSystemService(Context.VIBRATOR_SERVICE)).vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
    } else {
      ((Vibrator) c.getSystemService(Context.VIBRATOR_SERVICE)).vibrate(duration);
    }

  }
}
