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
    cookieManager.setAcceptFileSchemeCookies(true);
    cookieManager.setAcceptThirdPartyCookies(webView, true);
  }

  public void setCookiesEnabled(boolean accept) {
    cookieManager.setAcceptCookie(accept);
  }

  public void setCookie(final String url, final String value) {
    cookieManager.setCookie(url, value);
  }

  public String getCookie(final String url) {
    return cookieManager.getCookie(url);
  }

  public void clearCookies() {
    cookieManager.removeAllCookie();
  }

  public void flush() {
    cookieManager.flush();
  }
};