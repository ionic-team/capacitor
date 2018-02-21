package com.getcapacitor;

import android.animation.Animator;
import android.app.Activity;
import android.content.Context;
import android.graphics.PixelFormat;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.view.Gravity;
import android.view.WindowManager;
import android.view.animation.LinearInterpolator;
import android.widget.ImageView;

/**
 * A Splash Screen service for showing and hiding a splash screen in the app.
 */
public class Splash {
  public interface SplashListener {
    void completed();
    void error();
  }

  private static final String SPLASH_DRAWABLE = "splash";

  public static final int LAUNCH_SHOW_DURATION = 3000;

  public static final int DEFAULT_FADE_IN_DURATION = 200;
  public static final int DEFAULT_FADE_OUT_DURATION = 200;
  public static final int DEFAULT_SHOW_DURATION = 3000;
  public static final boolean DEFAULT_AUTO_HIDE = true;

  private static ImageView splashImage;
  private static WindowManager wm;
  private static boolean isVisible = false;
  private static boolean isHiding = false;

  private static void buildViews(Context c) {

    int splashId = c.getResources().getIdentifier("splash", "drawable", c.getPackageName());
    Drawable splash = c.getResources().getDrawable(splashId);

    splashImage = new ImageView(c);

    // Stops flickers dead in their tracks
    // https://stackoverflow.com/a/21847579/32140
    splashImage.setDrawingCacheEnabled(true);

    splashImage.setScaleType(ImageView.ScaleType.CENTER_CROP);
    splashImage.setImageDrawable(splash);
  }

  /**
   * Show the splash screen on launch without fading in
   * @param a
   */
  public static void showOnLaunch(final Activity a) {
    show(a, LAUNCH_SHOW_DURATION, 0, DEFAULT_FADE_OUT_DURATION, true, null);
  }

  /**
   * Show the Splash Screen with default settings
   * @param a
   */
  public static void show(final Activity a) {
    show(a, LAUNCH_SHOW_DURATION, DEFAULT_FADE_IN_DURATION, DEFAULT_FADE_OUT_DURATION, DEFAULT_AUTO_HIDE, null);
  }

  /**
   * Show the Splash Screen
   * @param a
   * @param showDuration how long to show the splash for if autoHide is enabled
   * @param fadeInDuration how long to fade the splash screen in
   * @param fadeOutDuration how long to fade the splash screen out
   * @param autoHide whether to auto hide after showDuration ms
   * @param splashListener A listener to handle the finish of the animation (if any)
   */
  public static void show(final Activity a,
                          final int showDuration,
                          final int fadeInDuration,
                          final int fadeOutDuration,
                          final boolean autoHide,
                          final SplashListener splashListener) {
    wm = (WindowManager)a.getSystemService(Context.WINDOW_SERVICE);

    if (a.isFinishing()) {
      return;
    }

    if (splashImage == null) {
      buildViews(a);
    }

    if (isVisible) {
      return;
    }

    final Animator.AnimatorListener listener = new Animator.AnimatorListener() {
      @Override
      public void onAnimationEnd(Animator animator) {
        isVisible = true;

        if (autoHide) {
          new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
              Splash.hide(a, fadeOutDuration);

              if (splashListener != null) {
                splashListener.completed();
              }
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

    Handler mainHandler = new Handler(a.getMainLooper());

    mainHandler.post(new Runnable() {
      @Override
      public void run() {

        WindowManager.LayoutParams params = new WindowManager.LayoutParams();
        params.gravity = Gravity.CENTER;

        // Required to enable the view to actually fade
        params.format = PixelFormat.TRANSLUCENT;

        wm.addView(splashImage, params);

        splashImage.setAlpha(0f);

        splashImage.animate()
            .alpha(1f)
            .setInterpolator(new LinearInterpolator())
            .setDuration(fadeInDuration)
            .setListener(listener)
            .start();
      }
    });

  }

  public static void hide(Context c, final int fadeOutDuration) {
    if (isHiding || splashImage == null || splashImage.getParent() == null) {
      return;
    }

    isHiding = true;

    final Animator.AnimatorListener listener = new Animator.AnimatorListener() {
      @Override
      public void onAnimationEnd(Animator animator) {
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

    Handler mainHandler = new Handler(c.getMainLooper());

    mainHandler.post(new Runnable() {
      @Override
      public void run() {
        splashImage.setAlpha(1f);

        splashImage.animate()
            .alpha(0)
            .setInterpolator(new LinearInterpolator())
            .setDuration(fadeOutDuration)
            .setListener(listener)
            .start();
      }
    });
  }

  private static void tearDown() {
    if (splashImage != null && splashImage.getParent() != null) {
      wm.removeView(splashImage);
    }

    isHiding = false;
    isVisible = false;
  }

  public static void onPause() {
    tearDown();
  }
  public static void onDestroy() {
    tearDown();
  }
}
