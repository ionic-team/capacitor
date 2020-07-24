package com.getcapacitor;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
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
    this(globalJS, coreJS, pluginJS, "" /* cordovaJS */, "" /* cordovaPluginsJS */, "" /* cordovaPluginsFileJS */, "" /* localUrlJS */);
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
   * Generates injectable JS content.
   * This may be used in other forms of injecting that aren't using an InputStream.
   * @return
   */
  public String getScriptString() {
    return globalJS + "\n\n" +
            coreJS + "\n\n" + pluginJS + "\n\n" + cordovaJS + "\n\n" +
            cordovaPluginsFileJS + "\n\n" + cordovaPluginsJS + "\n\n" +
            localUrlJS;
  }

  /**
   * Given an InputStream from the web server, prepend it with
   * our JS stream
   * @param responseStream
   * @return
   */
  public InputStream getInjectedStream(InputStream responseStream) {
    String js = "<script type=\"text/javascript\">" + getScriptString() + "</script>";
    String html = this.readAssetStream(responseStream);
    if (html.contains("<head>")) {
      html = html.replace("<head>", "<head>\n" + js + "\n");
    } else if (html.contains("</head>")) {
      html = html.replace("</head>", js + "\n" + "</head>");
    } else {
      Logger.error("Unable to inject Capacitor, Plugins won't work");
    }
    if (html.contains("iso-8859-1")) {
      return new ByteArrayInputStream(html.getBytes(StandardCharsets.ISO_8859_1));
    }
    else {
      return new ByteArrayInputStream(html.getBytes(StandardCharsets.UTF_8));
    }
  }

  private String readAssetStream(InputStream stream) {
    try {
      stream.mark(0);
      final int bufferSize = 1024;
      final char[] buffer = new char[bufferSize];
      final StringBuilder out = new StringBuilder();
      Reader in = new InputStreamReader(stream, "UTF-8");
      for (; ; ) {
        int rsz = in.read(buffer, 0, buffer.length);
        if (rsz < 0)
          break;
        out.append(buffer, 0, rsz);
      }
      if (out.toString().contains("iso-8859-1")) {
        stream.reset();
        final char[] buffer_iso = new char[bufferSize];
        final StringBuilder out_iso = new StringBuilder();
        Reader in_iso = new InputStreamReader(stream, "ISO-8859-1");
        for (; ; ) {
          int rsz = in_iso.read(buffer_iso, 0, buffer_iso.length);
          if (rsz < 0)
            break;
          out_iso.append(buffer_iso, 0, rsz);
        }
        return out_iso.toString();
      }
      else {
        return out.toString();
      }
    } catch (Exception e) {
      Logger.error("Unable to process HTML asset file. This is a fatal error", e);
    }

    return "";
  }

}
