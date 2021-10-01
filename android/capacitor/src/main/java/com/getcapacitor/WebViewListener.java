package com.getcapacitor;

import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

/**
 * Provides callbacks associated with the {@link BridgeWebViewClient}
 */
public abstract class WebViewListener {

    /**
     * Callback for page load event.
     *
     * @param webView The WebView that loaded
     */
    public void onPageLoaded(WebView webView) {
        // Override me to add behavior to the page loaded event
    }

    /**
     * Callback for onReceivedError event.
     *
     * @param webView The WebView that loaded
     * @param request The originating request.
     * @param error Information about the error occurred.
     */
    public void onReceivedError(WebView webView, WebResourceRequest request, WebResourceError error) {
        // Override me to add behavior to handle the onReceivedError event
    }

    /**
     * Callback for onReceivedHttpError event.
     *
     * @param webView The WebView that loaded
     * @param request The originating request.
     * @param errorResponse Information about the error occurred.
     */
    public void onReceivedHttpError(WebView webView, WebResourceRequest request, WebResourceResponse errorResponse) {
        // Override me to add behavior to handle the onReceivedHttpError event
    }

    /**
     * Callback for page start event.
     *
     * @param webView The WebView that loaded
     */
    public void onPageStarted(WebView webView) {
        // Override me to add behavior to the page started event
    }
}
