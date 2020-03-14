package com.getcapacitor.plugin;

import android.Manifest;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.view.HapticFeedbackConstants;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.HttpCookie;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Haptic engine plugin, also handles vibration.
 *
 * Requires the android.permission.VIBRATE permission.
 */
@NativePlugin()
public class Http extends Plugin {
  CookieManager cookieManager = new CookieManager();

  @Override
  public void load() {
    CookieHandler.setDefault(cookieManager);
  }

  @PluginMethod()
  public void request(PluginCall call) {
    String url = call.getString("url");
    String method = call.getString("method");
    JSObject headers = call.getObject("headers");
    JSObject params = call.getObject("params");

    switch (method) {
      case "GET":
      case "HEAD":
        get(call, url, method, headers, params);
        return;
      case "DELETE":
      case "PATCH":
      case "POST":
      case "PUT":
        mutate(call, url, method);
        return;
    }
  }

  private void get(PluginCall call, String urlString, String method, JSObject headers, JSObject params) {
    try {
      /*
      Uri.Builder builder = Uri.parse(urlString)
        .buildUpon();

       */
      URL url = new URL(urlString);


      HttpURLConnection conn = (HttpURLConnection) url.openConnection();
      conn.setRequestMethod(method);

      setRequestHeaders(conn, headers);

      conn.setDoInput(true);

      conn.connect();

      InputStream stream = conn.getInputStream();

      Log.d(getLogTag(), "GET request completed, got data");
    } catch (MalformedURLException ex) {
      call.error("Invalid URL", ex);
    } catch (IOException ex) {
      call.error("Error", ex);
    }
  }

  private void setRequestHeaders(HttpURLConnection conn, JSObject headers) {
    Iterator<String> keys = headers.keys();
    while (keys.hasNext()) {
      String key = keys.next();
      String value = headers.getString(key);
      conn.setRequestProperty(key, value);
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
    String url = call.getString("url");
    String key = call.getString("key");
    String value = call.getString("value");

    URI uri = getUri(url);
    if (uri == null) {
      call.error("Invalid URL");
      return;
    }

    cookieManager.getCookieStore().add(uri, new HttpCookie(key, value));

    call.resolve();
  }

  @PluginMethod()
  public void getCookies(PluginCall call) {
    String url = call.getString("url");

    URI uri = getUri(url);
    if (uri == null) {
      call.error("Invalid URL");
      return;
    }

    List<HttpCookie> cookies = cookieManager.getCookieStore().get(uri);

    JSArray cookiesArray = new JSArray();

    for (HttpCookie cookie : cookies) {
      JSObject ret = new JSObject();
      ret.put("key", cookie.getName());
      ret.put("value", cookie.getValue());
      cookiesArray.put(ret);
    }

    JSObject ret = new JSObject();
    ret.put("value", cookiesArray);
    call.resolve(ret);
  }

  @PluginMethod()
  public void deleteCookie(PluginCall call) {
    String url = call.getString("url");
    String key = call.getString("key");

    URI uri = getUri(url);
    if (uri == null) {
      call.error("Invalid URL");
      return;
    }


    List<HttpCookie> cookies = cookieManager.getCookieStore().get(uri);

    for (HttpCookie cookie : cookies) {
      if (cookie.getName().equals(key)) {
        cookieManager.getCookieStore().remove(uri, cookie);
      }
    }

    call.resolve();
  }

  @PluginMethod()
  public void clearCookies(PluginCall call) {
    cookieManager.getCookieStore().removeAll();
    call.resolve();
  }

  private URI getUri(String url) {
    try {
      return new URI(url);
    } catch (Exception ex) {
      return null;
    }
  }
}