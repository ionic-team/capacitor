package com.getcapacitor.plugin;

import android.animation.Animator;
import android.app.Dialog;
import android.content.res.Resources;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.view.ViewGroup;
import android.view.animation.LinearInterpolator;
import android.widget.ImageView;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class SplashScreen extends Plugin {
  private static final String SPLASH_DRAWABLE = "splash";

  private static final int LAUNCH_SHOW_DURATION = 10000;

  private static final int DEFAULT_FADE_IN_DURATION = 200;
  private static final int DEFAULT_FADE_OUT_DURATION = 200;
  private static final int DEFAULT_SHOW_DURATION = 3000;
  private static final boolean DEFAULT_AUTO_HIDE = true;

  private ImageView splashImage;
  private Dialog imageDialog;
  private boolean isVisible = false;

  @Override
  public void load() {
    try {
      buildViews();
    } catch(Resources.NotFoundException ex) {
      bridge.error("Unable to load splash resource. Ensure that splash.png exists as a drawable in res/drawable!");
    }
  }

  @PluginMethod()
  public void show(final PluginCall call) {
    if (splashImage == null) {
      call.error("Unable to load splash image. Ensure that splash.png exists as a drawable in res/drawable.");
      return;
    }

    int showDuration = call.getInt("showDuration", DEFAULT_SHOW_DURATION);
    int fadeInDuration = call.getInt("fadeInDuration", DEFAULT_FADE_IN_DURATION);
    int fadeOutDuration = call.getInt("fadeOutDuration", DEFAULT_FADE_OUT_DURATION);
    boolean autoHide = call.getBoolean("autoHide", DEFAULT_AUTO_HIDE);

    showSplash(showDuration, fadeInDuration, fadeOutDuration, autoHide, new SplashListener() {
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
    int fadeDuration = call.getInt("fadeOutDuration", DEFAULT_FADE_OUT_DURATION);
    hideSplash(fadeDuration);
    call.success();
  }

  private void buildViews() throws Resources.NotFoundException {
    // Get the resource id for our splash image
    int splashId = getContext().getResources().getIdentifier(SPLASH_DRAWABLE, "drawable", getContext().getPackageName());

    // Load the drawable
    Drawable splashDrawable = getContext().getDrawable(splashId);
    splashImage = new android.widget.ImageView(getContext());

    // Set the image on our ImageView
    splashImage.setImageDrawable(splashDrawable);

    // Aspect fill
    splashImage.setScaleType(ImageView.ScaleType.CENTER_CROP);

  }

  private void showSplash(final int showDuration,
                          final int fadeInDuration,
                          final int fadeOutDuration,
                          final boolean autoHide,
                          final SplashListener splashListener) {

    final Animator.AnimatorListener listener = new Animator.AnimatorListener() {
      @Override
      public void onAnimationEnd(Animator animator) {
        isVisible = true;

        if (autoHide) {
          new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
              hideSplash(fadeOutDuration);
              splashListener.completed();
            }
          }, showDuration);
        }
      }

      @Override
      public void onAnimationCancel(Animator animator) {}
      @Override
      public void onAnimationRepeat(Animator animator) {}
      @Override
      public void onAnimationStart(Animator animator) {}
    };

    bridge.executeOnMainThread(new Runnable() {
      @Override
      public void run() {
        // Build the dialog window that will contain the image
        imageDialog = new Dialog(getContext(), android.R.style.Theme_Black_NoTitleBar_Fullscreen);
        imageDialog.setContentView(splashImage);
        imageDialog.setCancelable(false);

        // Full screen dialog: https://stackoverflow.com/a/7597173/32140
        imageDialog.getWindow().setBackgroundDrawable(new ColorDrawable(android.graphics.Color.TRANSPARENT));

        splashImage.setAlpha(0f);

        imageDialog.show();

        splashImage.animate()
            .alpha(1f)
            .setInterpolator(new LinearInterpolator())
            .setDuration(fadeInDuration)
            .setListener(listener)
            .start();

      }
    });
  }

  private void hideSplash(final int fadeOutDuration) {
    if (!isVisible) {
      return;
    }

    final Animator.AnimatorListener listener = new Animator.AnimatorListener() {
      @Override
      public void onAnimationEnd(Animator animator) {
        imageDialog.dismiss();
        tearDown();
      }

      @Override
      public void onAnimationCancel(Animator animator) {
        tearDown();
      }

      @Override
      public void onAnimationStart(Animator animator) {}
      @Override
      public void onAnimationRepeat(Animator animator) {}
    };

    bridge.executeOnMainThread(new Runnable() {
      @Override
      public void run() {
        splashImage.animate()
            .alpha(0f)
            .setInterpolator(new LinearInterpolator())
            .setDuration(fadeOutDuration)
            .setListener(listener)
            .start();
      }
    });
  }

  private void tearDown() {
    isVisible = false;
    ViewGroup parent = (ViewGroup) splashImage.getParent();
    if (parent != null) {
      parent.removeView(splashImage);
    }
  }

  public void showOnLaunch() {
    showSplash(LAUNCH_SHOW_DURATION, 0, DEFAULT_FADE_OUT_DURATION, true, new SplashListener() {
      @Override
      public void completed() {
      }

      @Override
      public void error() {

      }
    });
  }

  @Override
  public void handleOnPause() {
    super.handleOnPause();
  }

  @Override
  protected void handleOnResume() {
    super.handleOnResume();
  }

  interface SplashListener {
    void completed();
    void error();
  }
}
