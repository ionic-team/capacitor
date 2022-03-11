package com.getcapacitor;

import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

/**
 * Represents the bridge.webview download proxy to jsInterface (DownloadJSInterface class).
 * Every download request from webview will be sent to the proxy, which decides to inject
 * dynamic javascript upon the 'protocol' interface aviability.
 */
public class DownloadJSProxy implements android.webkit.DownloadListener {
    final private Bridge bridge;
    final private DownloadJSInterface downloadInterface;
    public DownloadJSProxy(Bridge bridge) {
        this.bridge = bridge;
        this.downloadInterface = new DownloadJSInterface(this.bridge.getActivity());
        this.installServiceWorkerProxy();
    }

    //
    public DownloadJSInterface jsInterface() { return this.downloadInterface; }
    public String jsInterfaceName() { return "CapacitorDownloadInterface"; }
    @Override
    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        //Debug
        Logger.debug("Capacitor webview download start request", url);
        Logger.debug(userAgent + "  -  " + contentDisposition + "  -  " + mimeType);
        //Check if we can handle the URL..
        String bridge = this.downloadInterface.getJavascriptBridgeForURL(url, contentDisposition, mimeType);
        if (bridge != null) {
            this.bridge.getWebView().loadUrl(bridge);
        } else {
            Logger.info("Capacitor webview download has no handler for the following url", url);
        }
    }

    //
    private void installServiceWorkerProxy() {
        //Downloads can be done via webworker, webworkers might need local resources, we enable that
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            ServiceWorkerController swController = ServiceWorkerController.getInstance();
            swController.setServiceWorkerClient(new ServiceWorkerClient() {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                    Logger.debug("ServiceWorker Request", request.getUrl().toString());
                    return bridge.getLocalServer().shouldInterceptRequest(request);
                }
            });
        }
    }
}