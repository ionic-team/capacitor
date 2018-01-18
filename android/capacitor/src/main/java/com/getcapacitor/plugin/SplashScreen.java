package com.getcapacitor.plugin;

import android.animation.Animator;
import android.app.Dialog;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Matrix;
import android.graphics.Point;
import android.graphics.RectF;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.ViewGroup;
import android.view.animation.LinearInterpolator;
import android.widget.ImageView;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.Splash;

@NativePlugin()
public class SplashScreen extends Plugin {
  @PluginMethod()
  public void show(final PluginCall call) {
    int showDuration = call.getInt("showDuration", Splash.DEFAULT_SHOW_DURATION);
    int fadeInDuration = call.getInt("fadeInDuration", Splash.DEFAULT_FADE_IN_DURATION);
    int fadeOutDuration = call.getInt("fadeOutDuration", Splash.DEFAULT_FADE_OUT_DURATION);
    boolean autoHide = call.getBoolean("autoHide", Splash.DEFAULT_AUTO_HIDE);

    Splash.show(getContext(), showDuration, fadeInDuration, fadeOutDuration, autoHide, new Splash.SplashListener() {
      @Override
      public void completed() {
        call.success();
      }

      @Override
      public void error() {
        call.error("An error ocurred while showing splash");
      }
    });
  }

  @PluginMethod()
  public void hide(PluginCall call) {
    int fadeDuration = call.getInt("fadeOutDuration", Splash.DEFAULT_FADE_OUT_DURATION);
    Splash.hide(getContext(), fadeDuration);
    call.success();
  }
}
