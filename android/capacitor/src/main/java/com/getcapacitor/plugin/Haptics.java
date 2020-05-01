package com.getcapacitor.plugin;

import android.Manifest;
import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.HapticFeedbackConstants;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

/**
 * Haptic engine plugin, also handles vibration.
 *
 * Requires the android.permission.VIBRATE permission.
 */
@NativePlugin()
public class Haptics extends Plugin {

  boolean selectionStarted = false;

  @PluginMethod()
  @SuppressWarnings("MissingPermission")
  public void vibrate(PluginCall call) {
    Context c = this.getContext();
    int duration = call.getInt("duration", 300);

    if(!hasPermission(Manifest.permission.VIBRATE)) {
      call.error("Can't vibrate: Missing VIBRATE permission in AndroidManifest.xml");
      return;
    }

    if (Build.VERSION.SDK_INT >= 26) {
      ((Vibrator) c.getSystemService(Context.VIBRATOR_SERVICE)).vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
    } else {
      vibratePre26(duration);
    }

    call.success();
  }

  @SuppressWarnings({"deprecation", "MissingPermission"})
  private void vibratePre26(int duration) {
    ((Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE)).vibrate(duration);
  }

  @PluginMethod()
  public void impact(PluginCall call) {
    this.bridge.getWebView().performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);
    call.success();
  }

  @PluginMethod()
  public void notification(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void selectionStart(PluginCall call) {
    this.selectionStarted = true;
  }

  @PluginMethod()
  public void selectionChanged(PluginCall call) {
    if (this.selectionStarted) {
      this.bridge.getWebView().performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK);
    }
  }

  @PluginMethod()
  public void selectionEnd(PluginCall call) {
    this.selectionStarted = false;
  }
}
