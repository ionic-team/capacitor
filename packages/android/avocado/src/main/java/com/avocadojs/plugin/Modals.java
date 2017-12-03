package com.avocadojs.plugin;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.support.v4.app.ActivityCompat;
import android.view.HapticFeedbackConstants;

import com.avocadojs.Plugin;
import com.avocadojs.PluginBase;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

import java.security.Permission;

/**
 * Haptic engine plugin, also handles vibration.
 *
 * If you'd like to use this plugin for vibration,
 * add the following permissions to * your AndroidManifest.xml:
 * <uses-permission android:name="android.permission.VIBRATE"/>
 */
@Plugin(id="com.avocadojs.plugin.modals")
public class Modals extends PluginBase {

  @PluginMethod()
  public void alert(PluginCall call) {
    Context c = this.getContext();
    call.success();
  }

  @PluginMethod()
  public void confirm(PluginCall call) {
    // Not yet implemented
    call.success();
  }

  @PluginMethod()
  public void prompt(PluginCall call) {
    // Not yet implemented
    call.success();
  }
}
