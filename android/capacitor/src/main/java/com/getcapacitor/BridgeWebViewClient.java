package com.getcapacitor;

import android.graphics.Bitmap;
import android.net.Uri;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.List;

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
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        List<WebViewListener> webViewListeners = bridge.getWebViewListeners();

        if (webViewListeners != null && view.getProgress() == 100) {
            for (WebViewListener listener : bridge.getWebViewListeners()) {
                listener.onPageLoaded(view);
            }
        }
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        super.onReceivedError(view, request, error);

        List<WebViewListener> webViewListeners = bridge.getWebViewListeners();
        if (webViewListeners != null) {
            for (WebViewListener listener : bridge.getWebViewListeners()) {
                listener.onReceivedError(view);
            }
        }

        String errorPath = bridge.getErrorUrl();
        if (errorPath != null && request.isForMainFrame()) {
            view.loadUrl(errorPath);
        }
    }

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        super.onPageStarted(view, url, favicon);
        bridge.reset();
        List<WebViewListener> webViewListeners = bridge.getWebViewListeners();

        if (webViewListeners != null) {
            for (WebViewListener listener : bridge.getWebViewListeners()) {
                listener.onPageStarted(view);
            }
        }
    }

    @Override
    public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
        super.onReceivedHttpError(view, request, errorResponse);

        List<WebViewListener> webViewListeners = bridge.getWebViewListeners();
        if (webViewListeners != null) {
            for (WebViewListener listener : bridge.getWebViewListeners()) {
                listener.onReceivedHttpError(view);
            }
        }

        String errorPath = bridge.getErrorUrl();
        if (errorPath != null && request.isForMainFrame()) {
            view.loadUrl(errorPath);
        }
    }

    @Override
    public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
        super.onRenderProcessGone(view, detail);
        boolean result = false;

        List<WebViewListener> webViewListeners = bridge.getWebViewListeners();
        if (webViewListeners != null) {
            for (WebViewListener listener : bridge.getWebViewListeners()) {
                result = listener.onRenderProcessGone(view, detail) || result;
            }
        }

        return result;
    }

    @Override
    public void onPageCommitVisible(WebView view, String url) {
        super.onPageCommitVisible(view, url);

        List<WebViewListener> webViewListeners = bridge.getWebViewListeners();
        if (webViewListeners != null) {
            for (WebViewListener listener : bridge.getWebViewListeners()) {
                listener.onPageCommitVisible(view, url);
            }
        }
    }
}
