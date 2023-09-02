package com.getcapacitor;

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
     * Callback for page-visit changes that should lead to the user having different browsing state
     * and history.
     *
     * @param canGoBack Whether or not the user can go further back in the visit history
     */
    public void onUpdateVisitedHistory(boolean canGoBack) {
        // Override me to add behavior to the page-visit history update
    }
}
