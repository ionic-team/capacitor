package com.getcapacitor.plugin;

import android.content.Context;
import android.graphics.Point;
import android.graphics.Rect;
import android.os.Build;
import android.os.Handler;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.inputmethod.InputMethodManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

/**
 * Ported from https://github.com/ionic-team/cordova-plugin-ionic-keyboard/blob/master/src/android/IonicKeyboard.java
 */
@NativePlugin()
public class Keyboard extends Plugin {
  private ViewTreeObserver.OnGlobalLayoutListener list;
  private View rootView;

  private static final String EVENT_KB_WILL_SHOW = "keyboardWillShow";
  private static final String EVENT_KB_DID_SHOW = "keyboardDidShow";
  private static final String EVENT_KB_WILL_HIDE = "keyboardWillHide";
  private static final String EVENT_KB_DID_HIDE = "keyboardDidHide";


  public void load() {
    execute(new Runnable() {
      @Override
      public void run() {
        //calculate density-independent pixels (dp)
        //http://developer.android.com/guide/practices/screens_support.html
        DisplayMetrics dm = new DisplayMetrics();
        getActivity().getWindowManager().getDefaultDisplay().getMetrics(dm);
        final float density = dm.density;

        //http://stackoverflow.com/a/4737265/1091751 detect if keyboard is showing
        rootView = getActivity().getWindow().getDecorView().findViewById(android.R.id.content).getRootView();
        list = new ViewTreeObserver.OnGlobalLayoutListener() {
          int previousHeightDiff = 0;
          @Override
          public void onGlobalLayout() {
            Rect r = new Rect();
            //r will be populated with the coordinates of your view that area still visible.
            rootView.getWindowVisibleDisplayFrame(r);

            // cache properties for later use
            int rootViewHeight = rootView.getRootView().getHeight();
            int resultBottom = r.bottom;

            // calculate screen height differently for android versions >= 21: Lollipop 5.x, Marshmallow 6.x
            //http://stackoverflow.com/a/29257533/3642890 beware of nexus 5
            int screenHeight;

            if (Build.VERSION.SDK_INT >= 21) {
              Display display = getActivity().getWindowManager().getDefaultDisplay();
              Point size = new Point();
              display.getSize(size);
              screenHeight = size.y;
            } else {
              screenHeight = rootViewHeight;
            }

            int heightDiff = screenHeight - resultBottom;

            int pixelHeightDiff = (int)(heightDiff / density);
            if (pixelHeightDiff > 100 && pixelHeightDiff != previousHeightDiff) { // if more than 100 pixels, its probably a keyboard...
              String data = "{ 'keyboardHeight': " + pixelHeightDiff + " }";
              bridge.triggerWindowJSEvent(EVENT_KB_WILL_SHOW, data);
              bridge.triggerWindowJSEvent(EVENT_KB_DID_SHOW, data);
              JSObject kbData = new JSObject();
              kbData.put("keyboardHeight", pixelHeightDiff);
              notifyListeners(EVENT_KB_WILL_SHOW, kbData);
              notifyListeners(EVENT_KB_DID_SHOW, kbData);
            }
            else if ( pixelHeightDiff != previousHeightDiff && ( previousHeightDiff - pixelHeightDiff ) > 100 ){
              bridge.triggerWindowJSEvent(EVENT_KB_WILL_HIDE);
              bridge.triggerWindowJSEvent(EVENT_KB_DID_HIDE);
              JSObject kbData = new JSObject();
              notifyListeners(EVENT_KB_WILL_HIDE, kbData);
              notifyListeners(EVENT_KB_DID_HIDE, kbData);
            }
            previousHeightDiff = pixelHeightDiff;
          }
        };
        rootView.getViewTreeObserver().addOnGlobalLayoutListener(list);
      }
    });
  }

  @PluginMethod()
  public void show(final PluginCall call) {
    execute(new Runnable() {
      @Override
      public void run() {
        new Handler().postDelayed(new Runnable() {
          @Override
          public void run() {
            ((InputMethodManager) getActivity().getSystemService(Context.INPUT_METHOD_SERVICE)).toggleSoftInput(0, InputMethodManager.HIDE_IMPLICIT_ONLY);
            call.success(); // Thread-safe.
          }
        }, 350);
      }
    });
  }

  @PluginMethod()
  public void hide(final PluginCall call) {
    execute(new Runnable() {
      @Override
      public void run() {
        //http://stackoverflow.com/a/7696791/1091751
        InputMethodManager inputManager = (InputMethodManager) getActivity().getSystemService(Context.INPUT_METHOD_SERVICE);
        View v = getActivity().getCurrentFocus();

        if (v == null) {
          call.error("Can't close keyboard, not currently focused");
        } else {
          inputManager.hideSoftInputFromWindow(v.getWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
          call.success(); // Thread-safe.
        }
      }
    });
  }

  @PluginMethod()
  public void setAccessoryBarVisible(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void setStyle(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void setResizeMode(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void setScroll(PluginCall call) {
        call.unimplemented();
  }

}
