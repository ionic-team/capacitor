package com.getcapacitor.plugin;

import android.Manifest;
import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.HapticFeedbackConstants;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

/**
 * Haptic engine plugin, also handles vibration.
 *
 * Requires the android.permission.VIBRATE permission.
 */
@NativePlugin()
public class Http extends Plugin {
  @PluginMethod()
  public void request(PluginCall call) {
    String url = call.getString("url");
    String method = call.getString("method");

    switch (method) {
      case "GET":
      case "HEAD":
        get(call, url, method);
        return;
      case "DELETE":
      case "PATCH":
      case "POST":
      case "PUT":
        mutate(call, url, method);
        return;
    }
  }

  private void get(PluginCall call, String urlString, String method) {
    try {
      URL url = new URL(urlString);
      HttpURLConnection conn = (HttpURLConnection) url.openConnection();
      conn.setRequestMethod(method);
      
    } catch (IOException ex) {
      call.error("Error", ex);
    } catch (MalformedURLException ex) {
      call.error("Invalid URL", ex);
    }
  }

  private void mutate(PluginCall call, String url, String method) {
  }

  @PluginMethod()
  public void downloadFile(PluginCall call) {
  }

  @PluginMethod()
  public void uploadFile(PluginCall call) {
  }

  @PluginMethod()
  public void setCookie(PluginCall call) {
  }

  @PluginMethod()
  public void getCookie(PluginCall call) {
  }

  @PluginMethod()
  public void deleteCookie(PluginCall call) {
  }

  @PluginMethod()
  public void clearCookies(PluginCall call) {
  }
}