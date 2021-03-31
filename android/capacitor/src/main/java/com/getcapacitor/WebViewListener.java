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
    public void onPageLoaded(WebView webView) throws NotImplementedException {
        throw new NotImplementedException();
    }

    /**
     * Callback for page error event.
     *
     * @param webView
     */
    public void onPageError(WebView webView) throws NotImplementedException {
        throw new NotImplementedException();
    }

    static class NotImplementedException extends Exception {
        // Empty
    }
}
