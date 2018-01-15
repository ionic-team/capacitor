package com.getcapacitor.plugin;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class SplashScreen extends Plugin {
  private static final int DEFAULT_FADE_IN_DURATION = 200;
  private static final int DEFAULT_FADE_OUT_DURATION = 200;
  private static final int DEFAULT_SHOW_DURATION = 3000;
  private static final boolean DEFAULT_AUTO_HIDE = true;

  @Override
  public void load() {
    buildViews();
  }

  @PluginMethod()
  public void show(PluginCall call) {

  }

  @PluginMethod()
  public void hide(PluginCall call) {

  }

  private void buildViews() {

  }

  @Override
  public void handleOnPause() {
    super.handleOnPause();
  }

  @Override
  protected void handleOnResume() {
    super.handleOnResume();
  }
}
