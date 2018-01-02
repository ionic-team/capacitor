package com.avocadojs;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebView;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * JSExport generates JS APIs for plugins into a web environment so they are
 * available automatically to JS users.
 */
public class JSExport {

  public static void exportAvocadoJS(Context c, WebView webView) throws JSExportException {
    try {
      webView.addJavascriptInterface(new AvocadoJs(), "AvocadoJs");

      BufferedReader br = new BufferedReader(
          new InputStreamReader(c.getAssets().open("public/native-bridge.js")));

      StringBuffer b = new StringBuffer();
      String line;
      while((line = br.readLine()) != null) {
        b.append(line);
      }

      String js = b.toString();
      Log.d(Bridge.TAG, "Loaded JS for Avocado: \n" + js);

      webView.evaluateJavascript(js, null);
    } catch(IOException ex) {
      throw new JSExportException("Unable to export JS", ex);
    }
  }

  public static void exportJS(Context c, WebView webView, String pluginClassName, Class<? extends Plugin> pluginType) throws JSExportException {

  }
}

class AvocadoJs {
  @JavascriptInterface
  public String getInfo() {
    return "HELLO";
  }
}
