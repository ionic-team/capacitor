package com.getcapacitor.plugin;

import android.graphics.Color;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import com.getcapacitor.Bridge;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class StatusBar extends Plugin {

  @PluginMethod()
  public void setStyle(final PluginCall call) {
    final String style = call.getString("style");
    if (style == null) {
      call.error("Style must be provided");
      return;
    }

    getBridge().executeOnMainThread(new Runnable() {
      @Override
      public void run() {
        Window window = getActivity().getWindow();
        View decorView = window.getDecorView();

        int visibilityFlags = decorView.getSystemUiVisibility();

        if (style.equals("DARK")) {
           decorView.setSystemUiVisibility(visibilityFlags | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        } else {
          decorView.setSystemUiVisibility(visibilityFlags & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }
        call.success();
      }
    });
  }

  @PluginMethod()
  public void setBackgroundColor(final PluginCall call) {
    final String color = call.getString("color");
    if (color == null) {
      call.error("Color must be provided");
      return;
    }

    getBridge().executeOnMainThread(new Runnable() {
      @Override
      public void run() {
        Window window = getActivity().getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        try {
          window.setStatusBarColor(Color.parseColor(color.toUpperCase()));
          call.success();
        } catch (IllegalArgumentException ex) {
          call.error("Invalid color provided. Must be a hex string (ex: #ff0000");
        }
      }
    });
  }

  @PluginMethod()
  public void hide(final PluginCall call) {
    // Hide the status bar.
    getBridge().executeOnMainThread(new Runnable() {
      @Override
      public void run() {
        View decorView = getActivity().getWindow().getDecorView();
        int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN;
        decorView.setSystemUiVisibility(uiOptions);
        call.success();
      }
    });
  }

  @PluginMethod()
  public void show(final PluginCall call) {
    // Hide the status bar.
    getBridge().executeOnMainThread(new Runnable() {
      @Override
      public void run() {
        View decorView = getActivity().getWindow().getDecorView();

        // Hide the status bar.
        int uiOptions = View.SYSTEM_UI_FLAG_VISIBLE;
        decorView.setSystemUiVisibility(uiOptions);
        call.success();
      }
    });
  }
}
