package com.getcapacitor.cordova;

import android.webkit.CookieManager;
import android.webkit.WebView;
import org.apache.cordova.ICordovaCookieManager;

class CapacitorCordovaCookieManager implements ICordovaCookieManager {

    protected final WebView webView;
    private final CookieManager cookieManager;

    public CapacitorCordovaCookieManager(WebView webview) {
        webView = webview;
        cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptThirdPartyCookies(webView, true);
    }

    @Override
    public void setCookiesEnabled(boolean accept) {
        cookieManager.setAcceptCookie(accept);
    }

    @Override
    public void setCookie(final String url, final String value) {
        cookieManager.setCookie(url, value);
    }

    @Override
    public String getCookie(final String url) {
        return cookieManager.getCookie(url);
    }

    @Override
    public void clearCookies() {
        cookieManager.removeAllCookies(null);
    }

    @Override
    public void flush() {
        cookieManager.flush();
    }
}
