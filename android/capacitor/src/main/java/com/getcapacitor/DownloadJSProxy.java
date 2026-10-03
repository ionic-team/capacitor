package com.getcapacitor;

/**
 * Represents the bridge.webview download proxy to jsInterface (DownloadJSInterface class).
 * Every download request from webview will be sent to the proxy, which decides to inject
 * dynamic javascript upon the 'protocol' interface availability.
 *
 * Service worker interception is left to {@link Bridge}, which already installs a client
 * when {@code config.isResolveServiceWorkerRequests()} is true.
 */
public class DownloadJSProxy implements android.webkit.DownloadListener {

    private final Bridge bridge;
    private final DownloadJSInterface downloadInterface;

    public DownloadJSProxy(Bridge bridge) {
        this.bridge = bridge;
        this.downloadInterface = new DownloadJSInterface(this.bridge);
    }

    public DownloadJSInterface jsInterface() {
        return this.downloadInterface;
    }

    public String jsInterfaceName() {
        return "CapacitorDownloadInterface";
    }

    /* Public interceptors */
    public boolean shouldOverrideLoad(String url) {
        if (!url.startsWith("blob:")) return false;
        Logger.debug("Capacitor webview intercepted blob download request", url);
        String bridgeJs = this.downloadInterface.getJavascriptBridgeForURL(url, null, null);
        if (bridgeJs != null) {
            this.bridge.getWebView().loadUrl(bridgeJs);
            return true;
        } else {
            Logger.info("Capacitor webview download has no handler for the following url", url);
            return false;
        }
    }

    /* Public DownloadListener implementation */
    @Override
    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        Logger.debug("Capacitor webview download start request", url);
        Logger.debug(userAgent + "  -  " + contentDisposition + "  -  " + mimeType);
        String bridgeJs = this.downloadInterface.getJavascriptBridgeForURL(url, contentDisposition, mimeType);
        if (bridgeJs != null) {
            this.bridge.getWebView().loadUrl(bridgeJs);
        } else {
            Logger.info("Capacitor webview download has no handler for the following url", url);
        }
    }
}
