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
  private String coreJS;
  private String pluginJS;

  public JSInjector(String coreJS, String pluginJS) {
    this.coreJS = coreJS;
    this.pluginJS = pluginJS;
  }


  /**
   * Given an InputStream from the web server, prepend it with
   * our JS stream
   * @param responseStream
   * @return
   */
  public InputStream getInjectedStream(InputStream responseStream) {
    try {
      String js = "<script type=\"text/javascript\">" + coreJS + "\n\n" + pluginJS + "</script>";
      InputStream jsInputStream = new ByteArrayInputStream(js.getBytes(StandardCharsets.UTF_8.name()));
      return new SequenceInputStream(jsInputStream, responseStream);
    } catch(UnsupportedEncodingException ex) {
      Log.e(Bridge.TAG, "Unable to get encoding! Serious internal error, please file an issue", ex);
    }
    return null;
  }

}
