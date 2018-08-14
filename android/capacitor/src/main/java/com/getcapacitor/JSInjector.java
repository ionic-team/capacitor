package com.getcapacitor;

import android.util.Log;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.SequenceInputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

/**
 * JSInject is responsible for returning Capacitor's core
 * runtime JS and any plugin JS back into HTML page responses
 * to the client.
 */
class JSInjector {
  private String globalJS;
  private String coreJS;
  private String pluginJS;
  private String cordovaJS;
  private String cordovaPluginsJS;
  private String cordovaPluginsFileJS;
  private String localUrlJS;

  public JSInjector(String globalJS, String coreJS, String pluginJS) {
    this.globalJS = globalJS;
    this.coreJS = coreJS;
    this.pluginJS = pluginJS;
    this.cordovaJS = "";
    this.cordovaPluginsJS = "";
    this.cordovaPluginsFileJS = "";
    this.localUrlJS = "";
  }

  public JSInjector(String globalJS, String coreJS, String pluginJS, String cordovaJS, String cordovaPluginsJS, String cordovaPluginsFileJS, String localUrlJS) {
    this.globalJS = globalJS;
    this.coreJS = coreJS;
    this.pluginJS = pluginJS;
    this.cordovaJS = cordovaJS;
    this.cordovaPluginsJS = cordovaPluginsJS;
    this.cordovaPluginsFileJS = cordovaPluginsFileJS;
    this.localUrlJS = localUrlJS;
  }


  /**
   * Given an InputStream from the web server, prepend it with
   * our JS stream
   * @param responseStream
   * @return
   */
  public InputStream getInjectedStream(InputStream responseStream) {
    try {
      String js = "<script type=\"text/javascript\">" + globalJS + "\n\n" +
              coreJS + "\n\n" + pluginJS + "\n\n" + cordovaJS + "\n\n" +
              cordovaPluginsFileJS + "\n\n" + cordovaPluginsJS + "\n\n" +
              localUrlJS + "</script>";
      InputStream jsInputStream = new ByteArrayInputStream(js.getBytes(StandardCharsets.UTF_8.name()));
      return new SequenceInputStream(jsInputStream, responseStream);
    } catch(UnsupportedEncodingException ex) {
      Log.e(LogUtils.getCoreTag(), "Unable to get encoding! Serious internal error, please file an issue", ex);
    }
    return null;
  }

}
