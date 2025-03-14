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
    private String bridgeJS;
    private String pluginJS;
    private String cordovaJS;
    private String cordovaPluginsJS;
    private String cordovaPluginsFileJS;
    private String localUrlJS;
    private String miscJS;

    public JSInjector(
        String globalJS,
        String bridgeJS,
        String pluginJS,
        String cordovaJS,
        String cordovaPluginsJS,
        String cordovaPluginsFileJS,
        String localUrlJS
    ) {
        this(globalJS, bridgeJS, pluginJS, cordovaJS, cordovaPluginsJS, cordovaPluginsFileJS, localUrlJS, null);
    }

    public JSInjector(
        String globalJS,
        String bridgeJS,
        String pluginJS,
        String cordovaJS,
        String cordovaPluginsJS,
        String cordovaPluginsFileJS,
        String localUrlJS,
        String miscJS
    ) {
        this.globalJS = globalJS;
        this.bridgeJS = bridgeJS;
        this.pluginJS = pluginJS;
        this.cordovaJS = cordovaJS;
        this.cordovaPluginsJS = cordovaPluginsJS;
        this.cordovaPluginsFileJS = cordovaPluginsFileJS;
        this.localUrlJS = localUrlJS;
        this.miscJS = miscJS;
    }

    /**
     * Generates injectable JS content.
     * This may be used in other forms of injecting that aren't using an InputStream.
     * @return
     */
    public String getScriptString() {
        String scriptString =
            globalJS +
            "\n\n" +
            localUrlJS +
            "\n\n" +
            bridgeJS +
            "\n\n" +
            pluginJS +
            "\n\n" +
            cordovaJS +
            "\n\n" +
            cordovaPluginsFileJS +
            "\n\n" +
            cordovaPluginsJS;

        if (miscJS != null) {
            scriptString += "\n\n" + miscJS;
        }

        return scriptString;
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

        // Insert the js string at the position after <head> or before </head> using StringBuilder
        StringBuilder modifiedHtml = new StringBuilder(html);
        if (html.contains("<head>")) {
            modifiedHtml.insert(html.indexOf("<head>") + "<head>".length(), "\n" + js + "\n");
            html = modifiedHtml.toString();
        } else if (html.contains("</head>")) {
            modifiedHtml.insert(html.indexOf("</head>"), "\n" + js + "\n");
            html = modifiedHtml.toString();
        } else {
            Logger.error("Unable to inject Capacitor, Plugins won't work");
        }
        return new ByteArrayInputStream(html.getBytes(StandardCharsets.UTF_8));
    }

    private String readAssetStream(InputStream stream) {
        try {
            final int bufferSize = 1024;
            final char[] buffer = new char[bufferSize];
            final StringBuilder out = new StringBuilder();
            Reader in = new InputStreamReader(stream, StandardCharsets.UTF_8);
            for (;;) {
                int rsz = in.read(buffer, 0, buffer.length);
                if (rsz < 0) break;
                out.append(buffer, 0, rsz);
            }
            return out.toString();
        } catch (Exception e) {
            Logger.error("Unable to process HTML asset file. This is a fatal error", e);
        }

        return "";
    }
}
