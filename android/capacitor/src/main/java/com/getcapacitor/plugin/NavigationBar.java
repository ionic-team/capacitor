package com.globletech.firecontrolmanagement2005.plugins;

import android.graphics.Color;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class NavigationBar extends Plugin {

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
          decorView.setSystemUiVisibility(visibilityFlags & ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        } else {
          decorView.setSystemUiVisibility(visibilityFlags | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
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
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        try {
          int parsedColor = Color.parseColor(color.toUpperCase());
          window.setNavigationBarColor(parsedColor);
          call.success();
        } catch (IllegalArgumentException ex) {
          call.error("Invalid color provided. Must be a hex string (ex: #ff0000");
        }
      }
    });
  }

  @PluginMethod()
  public void show(final PluginCall call) {
    getBridge().executeOnMainThread(() -> {
      Window window = getActivity().getWindow();
      View decorView = window.getDecorView();
      int uiOptions = decorView.getSystemUiVisibility();
      uiOptions = uiOptions & ~View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
              & ~View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
              & ~View.SYSTEM_UI_FLAG_LAYOUT_STABLE
              & ~View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
      decorView.setSystemUiVisibility(uiOptions);
      call.success();
    });
  }

  @PluginMethod()
  public void hide(final PluginCall call) {
    getBridge().executeOnMainThread(() -> {
      Window window = getActivity().getWindow();
      View decorView = window.getDecorView();
      int uiOptions = decorView.getSystemUiVisibility();
      uiOptions = uiOptions | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
              | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
              | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
              | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
      decorView.setSystemUiVisibility(uiOptions);
      call.success();
    });
  }

  @PluginMethod()
  public void getInfo(final PluginCall call) {
    View decorView = getActivity().getWindow().getDecorView();
    Window window = getActivity().getWindow();

    String style;
    if ((decorView.getSystemUiVisibility() & View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR) == View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR) {
      style = "LIGHT";
    } else {
      style = "DARK";
    }

    JSObject data = new JSObject();
    data.put("style", style);
    data.put("color", String.format("#%06X", (0xFFFFFF & window.getNavigationBarColor())));
    call.resolve(data);
  }
}
