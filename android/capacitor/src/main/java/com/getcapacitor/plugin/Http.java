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

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
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
      Integer connectTimeout = call.getInt("connectTimeout");
      Integer readTimeout = call.getInt("readTimeout");

      URL url = new URL(urlString);

      HttpURLConnection conn = (HttpURLConnection) url.openConnection();
      conn.setAllowUserInteraction(false);
      conn.setRequestMethod(method);

      if (connectTimeout != null) {
        conn.setConnectTimeout(connectTimeout);
      }

      if (readTimeout != null) {
        conn.setReadTimeout(readTimeout);
      }

      setRequestHeaders(conn, headers);

      conn.connect();

      buildResponse(call, conn);
    } catch (MalformedURLException ex) {
      call.reject("Invalid URL", ex);
    } catch (IOException ex) {
      call.reject("Error", ex);
    } catch (Exception ex) {
      call.reject("Error", ex);
    }
  }

  private void buildResponse(PluginCall call, HttpURLConnection conn) throws Exception {
    int statusCode = conn.getResponseCode();

    JSObject ret = new JSObject();
    ret.put("status", statusCode);
    ret.put("headers", makeResponseHeaders(conn));

    InputStream stream = conn.getInputStream();

    BufferedReader in = new BufferedReader(new InputStreamReader(stream));
    StringBuilder builder = new StringBuilder();
    String line;
    while ((line = in.readLine()) != null) {
      builder.append(line);
    }
    in.close();

    Log.d(getLogTag(), "GET request completed, got data");

    String contentType = conn.getHeaderField("Content-Type");

    if (contentType != null) {
      if (contentType.contains("application/json")) {
        JSObject jsonValue = new JSObject(builder.toString());
        ret.put("data", jsonValue);
      } else {
        ret.put("data", builder.toString());
      }
    } else {
      ret.put("data", builder.toString());
    }

    call.resolve(ret);
  }

  private JSArray makeResponseHeaders(HttpURLConnection conn) {
    JSArray ret = new JSArray();

    for (Map.Entry<String, List<String>> entries : conn.getHeaderFields().entrySet()) {
      JSObject header = new JSObject();

      String val = "";
      for (String headerVal : entries.getValue()) {
        val += headerVal + ", ";
      }

      header.put(entries.getKey(), val);
      ret.put(header);
    }

    return ret;
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
      call.reject("Invalid URL");
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
      call.reject("Invalid URL");
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
      call.reject("Invalid URL");
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