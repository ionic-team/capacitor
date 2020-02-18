package com.getcapacitor;

import android.animation.Animator;
import android.app.Activity;
import android.content.Context;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.Animatable;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.LinearInterpolator;
import android.widget.ImageView;
import android.widget.ProgressBar;

/**
 * A Splash Screen service for showing and hiding a splash screen in the app.
 */
public class Splash {
  public interface SplashListener {
    void completed();
    void error();
  }

  public static final String CONFIG_KEY_PREFIX = "plugins.SplashScreen.";

  public static final int DEFAULT_LAUNCH_SHOW_DURATION = 3000;
  public static final int DEFAULT_FADE_IN_DURATION = 200;
  public static final int DEFAULT_FADE_OUT_DURATION = 200;
  public static final int DEFAULT_SHOW_DURATION = 3000;
  public static final boolean DEFAULT_AUTO_HIDE = true;
  public static final boolean DEFAULT_SPLASH_FULL_SCREEN = false;

  private static ImageView splashImage;
  private static ProgressBar spinnerBar;
  private static WindowManager wm;
  private static boolean isVisible = false;
  private static boolean isHiding = false;

  private static void buildViews(Context c) {
    if (splashImage == null) {
      String splashResourceName = Config.getString(CONFIG_KEY_PREFIX + "androidSplashResourceName", "splash");

      int splashId = c.getResources().getIdentifier(splashResourceName, "drawable", c.getPackageName());
      Drawable splash = c.getResources().getDrawable(splashId, c.getTheme());

      if (splash instanceof Animatable) {
        ((Animatable) splash).start();
      }

      splashImage = new ImageView(c);
      
      // Hide status bar during splash screen.
      Boolean splashFullScreen = Config.getBoolean(CONFIG_KEY_PREFIX + "splashFullScreen", DEFAULT_SPLASH_FULL_SCREEN);
      if(splashFullScreen){
        splashImage.setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN);
      }

      
      // Stops flickers dead in their tracks
      // https://stackoverflow.com/a/21847579/32140
      splashImage.setDrawingCacheEnabled(true);

      String backgroundColor = Config.getString(CONFIG_KEY_PREFIX + "backgroundColor");
      try {
        if (backgroundColor != null) {
          splashImage.setBackgroundColor(Color.parseColor(backgroundColor));
        }
      } catch (IllegalArgumentException ex) {
        Log.d(LogUtils.getCoreTag(), "Background color not applied");
      }

      String scaleTypeName = Config.getString(CONFIG_KEY_PREFIX + "androidScaleType", "FIT_XY");
      ImageView.ScaleType scaleType = null;
      try {
        scaleType = ImageView.ScaleType.valueOf(scaleTypeName);
      } catch (IllegalArgumentException ex) {
        scaleType = ImageView.ScaleType.FIT_XY;
      }

      splashImage.setScaleType(scaleType);
      splashImage.setImageDrawable(splash);
    }

    if (spinnerBar == null) {
      String spinnerStyle = Config.getString(CONFIG_KEY_PREFIX + "androidSpinnerStyle");
      if (spinnerStyle != null) {
        int spinnerBarStyle = android.R.attr.progressBarStyleLarge;

        switch (spinnerStyle.toLowerCase()) {
          case "horizontal":
            spinnerBarStyle = android.R.attr.progressBarStyleHorizontal;
            break;
          case "small":
            spinnerBarStyle = android.R.attr.progressBarStyleSmall;
            break;
          case "large":
            spinnerBarStyle = android.R.attr.progressBarStyleLarge;
            break;
          case "inverse":
            spinnerBarStyle = android.R.attr.progressBarStyleInverse;
            break;
          case "smallinverse":
            spinnerBarStyle = android.R.attr.progressBarStyleSmallInverse;
            break;
          case "largeinverse":
            spinnerBarStyle = android.R.attr.progressBarStyleLargeInverse;
            break;
        }

        spinnerBar = new ProgressBar(c, null, spinnerBarStyle);
      } else {
        spinnerBar = new ProgressBar(c);
      }
      spinnerBar.setIndeterminate(true);

      String spinnerColor = Config.getString(CONFIG_KEY_PREFIX + "spinnerColor");
      try {
        if (spinnerColor != null) {
          int[][] states = new int[][]{
                  new int[]{android.R.attr.state_enabled}, // enabled
                  new int[]{-android.R.attr.state_enabled}, // disabled
                  new int[]{-android.R.attr.state_checked}, // unchecked
                  new int[]{android.R.attr.state_pressed}  // pressed
          };
          int spinnerBarColor = Color.parseColor(spinnerColor);
          int[] colors = new int[]{
                  spinnerBarColor,
                  spinnerBarColor,
                  spinnerBarColor,
                  spinnerBarColor
          };
          ColorStateList colorStateList = new ColorStateList(states, colors);
          spinnerBar.setIndeterminateTintList(colorStateList);
        }
      } catch (IllegalArgumentException ex) {
        Log.d(LogUtils.getCoreTag(), "Spinner color not applied");
      }
    }
  }

  /**
   * Show the splash screen on launch without fading in
   * @param a
   */
  public static void showOnLaunch(final BridgeActivity a) {
    Integer duration = Config.getInt(CONFIG_KEY_PREFIX + "launchShowDuration", DEFAULT_LAUNCH_SHOW_DURATION);
    Boolean autohide = Config.getBoolean(CONFIG_KEY_PREFIX + "launchAutoHide", DEFAULT_AUTO_HIDE);
    show(a, duration, 0, DEFAULT_FADE_OUT_DURATION, autohide, null, true);
  }

  /**
   * Show the Splash Screen with default settings
   * @param a
   */
  public static void show(final Activity a) {
    show(a, DEFAULT_LAUNCH_SHOW_DURATION, DEFAULT_FADE_IN_DURATION, DEFAULT_FADE_OUT_DURATION, DEFAULT_AUTO_HIDE, null);
  }

  /**
   * Show the Splash Screen
   */
  public static void show(final Activity a,
                          final int showDuration,
                          final int fadeInDuration,
                          final int fadeOutDuration,
                          final boolean autoHide,
                          final SplashListener splashListener) {
    show(a, showDuration, fadeInDuration, fadeOutDuration, autoHide, splashListener, false);
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
                          final SplashListener splashListener,
                          final boolean isLaunchSplash) {
    wm = (WindowManager)a.getSystemService(Context.WINDOW_SERVICE);

    if (a.isFinishing()) {
      return;
    }

    buildViews(a);

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
              Splash.hide(a, fadeOutDuration, isLaunchSplash);

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
        params.flags = a.getWindow().getAttributes().flags & (WindowManager.LayoutParams.FLAG_FULLSCREEN);

        // Required to enable the view to actually fade
        params.format = PixelFormat.TRANSLUCENT;

        try {
          wm.addView(splashImage, params);
        } catch (IllegalStateException ex) {
          Log.d(LogUtils.getCoreTag(), "Could not add splash view");
        }

        splashImage.setAlpha(0f);

        splashImage.animate()
                .alpha(1f)
                .setInterpolator(new LinearInterpolator())
                .setDuration(fadeInDuration)
                .setListener(listener)
                .start();

        splashImage.setVisibility(View.VISIBLE);

        if (spinnerBar != null) {
          Boolean showSpinner = Config.getBoolean(CONFIG_KEY_PREFIX + "showSpinner", false);

          spinnerBar.setVisibility(View.INVISIBLE);

          if (spinnerBar.getParent() != null) {
            wm.removeView(spinnerBar);
          }

          params.height = WindowManager.LayoutParams.WRAP_CONTENT;
          params.width = WindowManager.LayoutParams.WRAP_CONTENT;

          wm.addView(spinnerBar, params);

          if (showSpinner) {
            spinnerBar.setAlpha(0f);

            spinnerBar.animate()
                    .alpha(1f)
                    .setInterpolator(new LinearInterpolator())
                    .setDuration(fadeInDuration)
                    .start();

            spinnerBar.setVisibility(View.VISIBLE);
          }
        }
      }
    });

  }

  public static void hide(Context c, final int fadeOutDuration) {
    hide(c, fadeOutDuration, false);
  }

  public static void hide(Context c, final int fadeOutDuration, boolean isLaunchSplash) {
    // Warn the user if the splash was hidden automatically, which means they could be experiencing an app
    // that feels slower than it actually is.
    if(isLaunchSplash && isVisible) {
      Log.d(LogUtils.getCoreTag(), "SplashScreen was automatically hidden after the launch timeout. " +
              "You should call `SplashScreen.hide()` as soon as your web app is loaded (or increase the timeout)." +
              "Read more at https://capacitor.ionicframework.com/docs/apis/splash-screen/#hiding-the-splash-screen");
    }

    if (isHiding || splashImage == null || splashImage.getParent() == null) {
      return;
    }

    isHiding = true;

    final Animator.AnimatorListener listener = new Animator.AnimatorListener() {
      @Override
      public void onAnimationEnd(Animator animator) {
        tearDown(false);
      }

      @Override
      public void onAnimationCancel(Animator animator) {
        tearDown(false);
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
        if (spinnerBar != null) {
          spinnerBar.setAlpha(1f);

          spinnerBar.animate()
                  .alpha(0)
                  .setInterpolator(new LinearInterpolator())
                  .setDuration(fadeOutDuration)
                  .start();
        }

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

  private static void tearDown(boolean removeSpinner) {
    if (spinnerBar != null && spinnerBar.getParent() != null) {
      spinnerBar.setVisibility(View.INVISIBLE);

      if (removeSpinner == true) {
        wm.removeView(spinnerBar);
      }
    }

    if (splashImage != null && splashImage.getParent() != null) {
      splashImage.setVisibility(View.INVISIBLE);

      wm.removeView(splashImage);
    }

    isHiding = false;
    isVisible = false;
  }

  public static void onPause() {
    tearDown(true);
  }
  public static void onDestroy() {
    tearDown(true);
  }
}
