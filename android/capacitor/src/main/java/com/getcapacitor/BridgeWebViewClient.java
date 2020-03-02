package com.getcapacitor;

import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class BridgeWebViewClient extends WebViewClient {
  private Bridge bridge;

  public BridgeWebViewClient(Bridge bridge) {
    this.bridge = bridge;
  }

  @Override
  public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
    return bridge.getLocalServer().shouldInterceptRequest(request);
  }

  @Override
  public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
    Uri url = request.getUrl();
    return bridge.launchIntent(url);
  }

  @Override
  public boolean shouldOverrideUrlLoading(WebView view, String url) {
    return bridge.launchIntent(Uri.parse(url));
  }

}
