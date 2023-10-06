package com.getcapacitor;

import android.webkit.RenderProcessGoneDetail;
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
     */
    public void onReceivedError(WebView webView) {
        // Override me to add behavior to handle the onReceivedError event
    }

    /**
     * Callback for onReceivedHttpError event.
     *
     * @param webView The WebView that loaded
     */
    public void onReceivedHttpError(WebView webView) {
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

    /**
     * Callback for render process gone event. Return true if the state is handled.
     *
     * @param webView The WebView that loaded
     * @return returns false by default if the listener is not overridden and used
     */
    public boolean onRenderProcessGone(WebView webView, RenderProcessGoneDetail detail) {
        // Override me to add behavior to the web view render process gone event
        return false;
    }
}
