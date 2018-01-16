package com.getcapacitor.plugin;

import android.app.Dialog;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;

import com.getcapacitor.Bridge;
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

  private ImageView splashImage;

  @Override
  public void load() {
    buildViews();
  }

  @PluginMethod()
  public void show(PluginCall call) {
    if (splashImage == null) {
      call.error("Unable to load splash image. Ensure that splash.png exists as a drawable in res/drawable.");
      return;
    }

    //View root = getActivity().getWindow().getDecorView().getRootView();

    // Full screen dialog: https://stackoverflow.com/a/7597173/32140
    Dialog imageDialog = new Dialog(getContext(), android.R.style.Theme_Black_NoTitleBar_Fullscreen);
    imageDialog.setContentView(splashImage);
    imageDialog.show();
  }

  @PluginMethod()
  public void hide(PluginCall call) {

  }

  private void buildViews() {
    // Get the resource id for our splash image
    int splashId = getContext().getResources().getIdentifier("screen", "drawable", getContext().getPackageName());

    // Load the drawable
    Drawable splashDrawable = getContext().getDrawable(splashId);
    splashImage = new android.widget.ImageView(getContext());

    // Set the image on our ImageView
    splashImage.setImageDrawable(splashDrawable);

    // Aspect fill
    splashImage.setScaleType(ImageView.ScaleType.CENTER_CROP);
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
