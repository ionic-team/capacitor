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
}
