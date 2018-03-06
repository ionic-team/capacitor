package com.getcapacitor.plugin;

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

    Splash.show(getActivity(), showDuration, fadeInDuration, fadeOutDuration, autoHide, new Splash.SplashListener() {
      @Override
      public void completed() {
        call.success();
      }

      @Override
      public void error() {
        call.error("An error occurred while showing splash");
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
