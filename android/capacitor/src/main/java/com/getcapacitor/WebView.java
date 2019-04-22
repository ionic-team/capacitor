package com.getcapacitor;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.webkit.*;

import org.xwalk.core.*;

import java.io.InputStream;
import java.util.Map;

public class WebView {
    private android.webkit.WebView webView;
    private XWalkView xwalkView;

    public static String getWebViewVersion(android.webkit.WebView webView) {
        return getChromeVersion(webView.getSettings().getUserAgentString());
    }

    public static String getXWalkVersion(XWalkView xwalkView) {
        return getChromeVersion(xwalkView.getSettings().getUserAgentString());
    }

    public static String getChromeVersion(String userAgent) {
        String chromeVer = userAgent.replaceFirst(".*Chrome/([.0-9]+).*", "$1");

        return userAgent.equals(chromeVer) ? "0.0.0.0" : chromeVer;
    }

    public static void setWebContentsDebuggingEnabled(boolean enabled) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            android.webkit.WebView.setWebContentsDebuggingEnabled(enabled);
        }
    }

    public static void setXWalkWebContentsDebuggingEnabled(boolean enabled) {
        XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, enabled);
    }

    public WebView(android.webkit.WebView webView) {
        Log.i(LogUtils.getCoreTag(), "Using System WebView " + getWebViewVersion(webView));

        this.webView = webView;
    }

    public WebView(XWalkView xwalkView) {
        Log.i(LogUtils.getCoreTag(), "Using XWalk WebView " + getXWalkVersion(xwalkView));

        this.xwalkView = xwalkView;
    }

    public void destroy() {
        if (webView != null) {
            webView.destroy();
        } else {
            xwalkView.onDestroy();
        }
    }

    public void removeAllViews() {
        if (webView != null) {
            webView.removeAllViews();
        } else {
            xwalkView.removeAllViews();
        }
    }

    public View getView() {
        return webView != null ? webView : xwalkView;
    }

    public void post(Runnable runnable) {
        getView().post(runnable);
    }

    public Context getContext() {
        return webView != null ? webView.getContext() : xwalkView.getContext();
    }

    public void setWebChromeClient(final WebChromeClient client) {
        if (webView != null) {
            webView.setWebChromeClient(new android.webkit.WebChromeClient() {
                @Override public boolean onJsAlert(android.webkit.WebView view, String url, String message, android.webkit.JsResult result) {
                    return client.onJsAlert(WebView.this, url, message, new JsResult(result));
                }

                @Override public boolean onJsConfirm(android.webkit.WebView view, String url, String message, android.webkit.JsResult result) {
                    return client.onJsConfirm(WebView.this, url, message, new JsResult(result));
                }

                @Override public boolean onJsPrompt(android.webkit.WebView view, String url, String message, String defaultValue, android.webkit.JsPromptResult result) {
                    return client.onJsPrompt(WebView.this, url, message, defaultValue, new JsPromptResult(result));
                }

                @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                    client.onGeolocationPermissionsShowPrompt(origin, callback);
                }

                @Override public void onPermissionRequest(PermissionRequest request) {
                    client.onPermissionRequest(request);
                }

                @Override public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                    return client.onConsoleMessage(consoleMessage);
                }

                @Override public boolean onShowFileChooser(android.webkit.WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                    return client.onShowFileChooser(WebView.this, filePathCallback, new WebChromeClient.FileChooserParams(fileChooserParams));
                }
            });
        }
        else {
            xwalkView.setUIClient(new XWalkUIClient(xwalkView) {
                @Override public boolean onJsAlert(XWalkView view, String url, String message, XWalkJavascriptResult result) {
                    return client.onJsAlert(WebView.this, url, message, new JsResult(result));
                }

                @Override public boolean onJsConfirm(XWalkView view, String url, String message, XWalkJavascriptResult result) {
                    return client.onJsConfirm(WebView.this, url, message, new JsResult(result));
                }

                @Override public boolean onJsPrompt(XWalkView view, String url, String message, String defaultValue, XWalkJavascriptResult result) {
                    return client.onJsPrompt(WebView.this, url, message, defaultValue, new JsPromptResult(result));
                }

                @Override public boolean onConsoleMessage(XWalkView view, String message, int lineNumber, String sourceId, ConsoleMessageType messageType) {
                    ConsoleMessage.MessageLevel level = ConsoleMessage.MessageLevel.TIP;

                    switch (messageType) {
                        case ERROR:   level = ConsoleMessage.MessageLevel.ERROR;   break;
                        case LOG:     level = ConsoleMessage.MessageLevel.LOG;     break;
                        case INFO:    level = ConsoleMessage.MessageLevel.TIP;     break;
                        case WARNING: level = ConsoleMessage.MessageLevel.WARNING; break;
                    }

                    if (client.onConsoleMessage(new ConsoleMessage(message, sourceId, lineNumber, level))) {
                        return true;
                    }
                    else {
                        return super.onConsoleMessage(view, message, lineNumber, sourceId, messageType);
                    }
                }

                @Override public void openFileChooser(XWalkView view, final ValueCallback<Uri> uploadFile, final String acceptType, final String capture) {
                    if (!client.onShowFileChooser(WebView.this, new ValueCallback<Uri[]>() {
                        @Override public void onReceiveValue(Uri[] value) {
                            if (value == null || value.length == 0) {
                                uploadFile.onReceiveValue(null);
                            }
                            else if (value.length == 1) {
                                uploadFile.onReceiveValue(value[0]);
                            } else {
                                Log.e(LogUtils.getCoreTag(), "Expected a single file from FileChooser, got " + value.length);
                                uploadFile.onReceiveValue(value[0]);
                            }
                        }
                    }, new WebChromeClient.FileChooserParams(acceptType, capture))) {
                        super.openFileChooser(view, uploadFile, acceptType, capture);
                    }
                }
            });
        }
    }

    public void setWebViewClient(final WebViewClient client) {
        if (webView != null) {
            webView.setWebViewClient(new android.webkit.WebViewClient() {
                @Override public boolean shouldOverrideUrlLoading(android.webkit.WebView view, String url) {
                    return client.shouldOverrideUrlLoading(WebView.this, url);
                }

                @Override public boolean shouldOverrideUrlLoading(android.webkit.WebView view, android.webkit.WebResourceRequest request) {
                    return client.shouldOverrideUrlLoading(WebView.this, new WebResourceRequest(request));
                }

                @Nullable @Override public android.webkit.WebResourceResponse shouldInterceptRequest(android.webkit.WebView view, String url) {
                    return client.shouldInterceptRequest(WebView.this, url);
                }

                @Nullable @Override public android.webkit.WebResourceResponse shouldInterceptRequest(android.webkit.WebView view, android.webkit.WebResourceRequest request) {
                    return client.shouldInterceptRequest(WebView.this, new WebResourceRequest(request));
                }
            });
        }
        else {
            xwalkView.setResourceClient(new XWalkResourceClient(xwalkView) {
                @Override public android.webkit.WebResourceResponse shouldInterceptLoadRequest(XWalkView view, String url) {
                    return client.shouldInterceptRequest(WebView.this, url);
                }

                @Override public XWalkWebResourceResponse shouldInterceptLoadRequest(XWalkView view, final XWalkWebResourceRequest request) {
                    WebResourceResponse response = client.shouldInterceptRequest(WebView.this, new WebResourceRequest(request));

                    if (response != null) {
                        return createXWalkWebResourceResponse(response.getMimeType(), response.getEncoding(), response.getData(),
                                                              response.getStatusCode(), response.getReasonPhrase(), response.getResponseHeaders());
                    } else {
                        return null;
                    }
                }

                @Override public boolean shouldOverrideUrlLoading(XWalkView view, String url) {
                    return client.shouldOverrideUrlLoading(WebView.this, url);
                }
            });
        }
    }

    public void onPause() {
        if (webView != null) {
            webView.onPause();
        } else {
            // No Crosswalk API for this
        }
    }

    public void onResume() {
        if (webView != null) {
            webView.onResume();
        } else {
            // No Crosswalk API for this
        }
    }

    public void pauseTimers() {
        if (webView != null) {
            webView.pauseTimers();
        } else {
            xwalkView.pauseTimers();
        }
    }

    public void resumeTimers() {
        if (webView != null) {
            webView.resumeTimers();
        } else {
            xwalkView.resumeTimers();
        }
    }

    public void loadUrl(String url) {
        if (webView != null) {
            webView.loadUrl(url);
        } else {
            xwalkView.loadUrl(url);
        }
    }

    public boolean canGoBack() {
        if (webView != null) {
            return webView.canGoBack();
        } else {
            return xwalkView.getNavigationHistory().canGoBack();
        }
    }

    public void goBack() {
        if (webView != null) {
            webView.goBack();
        } else {
            xwalkView.getNavigationHistory().navigate(XWalkNavigationHistory.Direction.BACKWARD, 1);
        }
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP) public void evaluateJavascript(String script, ValueCallback<String> resultCallback) {
        if (webView != null) {
            webView.evaluateJavascript(script, resultCallback);
        } else {
            xwalkView.evaluateJavascript(script, resultCallback);
        }
    }

    @SuppressLint({"AddJavascriptInterface", "JavascriptInterface"}) public void addJavascriptInterface(Object object, String name) {
        if (webView != null) {
            webView.addJavascriptInterface(object, name);
        }
        else {
            xwalkView.addJavascriptInterface(object, name);
        }
    }

    public CookieManager getCookieManager() {
        return new CookieManager();
    }

    public WebSettings getSettings() {
        return new WebSettings();
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP) public class CookieManager {
        private android.webkit.CookieManager cookieManager;
        private XWalkCookieManager xwalkCookieManager;

        private CookieManager() {
            if (webView != null) {
                cookieManager = android.webkit.CookieManager.getInstance();
            } else {
                xwalkCookieManager = new XWalkCookieManager();
            }
        }

        public Object getCookieManager() {
            if (webView != null) {
                return cookieManager;
            } else {
                return xwalkCookieManager;
            }
        }

        public void setAcceptCookie(boolean accept) {
            if (cookieManager != null) {
                cookieManager.setAcceptCookie(accept);
            } else {
                xwalkCookieManager.setAcceptCookie(accept);
            }
        }

        public void setAcceptFileSchemeCookies(boolean accept) {
            if (cookieManager != null) {
                cookieManager.setAcceptFileSchemeCookies(accept);
            } else {
                xwalkCookieManager.setAcceptFileSchemeCookies(accept);
            }
        }

        public void setAcceptThirdPartyCookies(WebView webView, boolean accept) {
            if (cookieManager != null) {
                cookieManager.setAcceptThirdPartyCookies(webView.webView, accept);
            } else {
                // No Crosswalk API for this
            }
        }

        public void setCookie(String url, String value) {
            if (cookieManager != null) {
                cookieManager.setCookie(url, value);
            } else {
                xwalkCookieManager.setCookie(url, value);
            }
        }

        public String getCookie(String url) {
            if (cookieManager != null) {
                return cookieManager.getCookie(url);
            } else {
                return xwalkCookieManager.getCookie(url);
            }
        }

        public void removeAllCookie() {
            if (cookieManager != null) {
                cookieManager.removeAllCookie();
            } else {
                xwalkCookieManager.removeAllCookie();
            }
        }

        public void flush() {
            if (cookieManager != null) {
                cookieManager.flush();
            } else {
                xwalkCookieManager.flushCookieStore();
            }
        }
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP) public class WebSettings {
        android.webkit.WebSettings webSettings;
        XWalkSettings xwalkSettings;

        public static final int MIXED_CONTENT_ALWAYS_ALLOW = 0;

        private WebSettings() {
            if (webView != null) {
                webSettings = webView.getSettings();
            }
            else {
                xwalkSettings = xwalkView.getSettings();
            }
        }

        public Object getWebSettings() {
            if (webView != null) {
                return webSettings;
            } else {
                return xwalkSettings;
            }
        }

        public void setJavaScriptEnabled(boolean enabled) {
            if (webSettings != null) {
                webSettings.setJavaScriptEnabled(enabled);
            } else {
                xwalkSettings.setJavaScriptEnabled(enabled);
            }
        }

        public void setDomStorageEnabled(boolean enabled) {
            if (webSettings != null) {
                webSettings.setDomStorageEnabled(enabled);
            } else {
                xwalkSettings.setDomStorageEnabled(enabled);
            }
        }

        public void setGeolocationEnabled(boolean enabled) {
            if (webSettings != null) {
                webSettings.setGeolocationEnabled(enabled);
            } else {
                // No Crosswalk API for this
            }
        }

        public void setDatabaseEnabled(boolean enabled) {
            if (webSettings != null) {
                webSettings.setDatabaseEnabled(enabled);
            } else {
                xwalkSettings.setDatabaseEnabled(enabled);
            }
        }

        public void setAppCacheEnabled(boolean enabled) {
            if (webSettings != null) {
                webSettings.setAppCacheEnabled(enabled);
            } else {
                // No Crosswalk API for this
            }
        }

        public void setMediaPlaybackRequiresUserGesture(boolean enabled) {
            if (webSettings != null) {
                webSettings.setMediaPlaybackRequiresUserGesture(enabled);
            } else {
                xwalkSettings.setMediaPlaybackRequiresUserGesture(enabled);
            }
        }

        public void setJavaScriptCanOpenWindowsAutomatically(boolean enabled) {
            if (webSettings != null) {
                webSettings.setJavaScriptCanOpenWindowsAutomatically(enabled);
            } else {
                xwalkSettings.setJavaScriptCanOpenWindowsAutomatically(enabled);
            }
        }

        public void setMixedContentMode(int mode) {
            if (webSettings != null) {
                webSettings.setMixedContentMode(mode);
            } else {
                // No Crosswalk API for this
            }
        }

        public void setUserAgentString(String ua) {
            if (webSettings != null) {
                webSettings.setUserAgentString(ua);
            } else {
                xwalkSettings.setUserAgentString(ua);
            }
        }

        public String getUserAgentString() {
            if (webSettings != null) {
                return webSettings.getUserAgentString();
            } else {
                return xwalkSettings.getUserAgentString();
            }
        }
    }

    public static class WebResourceRequest {
        private Uri uri;
        boolean isForMainFrame;
        boolean isRedirect;
        boolean hasGesture;
        String method;
        Map<String, String> requestHeaders;

        @TargetApi(Build.VERSION_CODES.N) private WebResourceRequest(android.webkit.WebResourceRequest request) {
            uri            = request.getUrl();
            isForMainFrame = request.isForMainFrame();
            isRedirect     = request.isRedirect();
            hasGesture     = request.hasGesture();
            method         = request.getMethod();
            requestHeaders = request.getRequestHeaders();
        }

        private WebResourceRequest(XWalkWebResourceRequest request) {
            uri            = request.getUrl();
            isForMainFrame = request.isForMainFrame();
            isRedirect     = false; // No Crosswalk API for this
            hasGesture     = request.hasGesture();
            method         = request.getMethod();
            requestHeaders = request.getRequestHeaders();
        }

        public Uri getUrl() {
            return uri;
        }

        public boolean isForMainFrame() {
            return isForMainFrame;
        }

        public boolean isRedirect() {
            return isRedirect;
        }

        public boolean hasGesture() {
            return hasGesture;
        }

        public String getMethod() {
            return method;
        }

        public Map<String, String> getRequestHeaders() {
            return requestHeaders;
        }
    }

    public static class WebResourceResponse extends android.webkit.WebResourceResponse {
        private String reasonPhrase;
        private Map<String, String> responseHeaders;
        private int statusCode;

        public WebResourceResponse(String mimeType, String encoding, InputStream data) {
            super(mimeType, encoding, data);
        }

        public WebResourceResponse(String mimeType, String encoding, int statusCode,
                                   String reasonPhrase, Map<String, String> responseHeaders, InputStream data) {
            super(mimeType, encoding, data);
            setStatusCodeAndReasonPhrase(statusCode, reasonPhrase);
            setResponseHeaders(responseHeaders);
        }

        @Override public String getReasonPhrase() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                return super.getReasonPhrase();
            } else {
                return reasonPhrase;
            }
        }

        @Override public Map<String, String> getResponseHeaders() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                return super.getResponseHeaders();
            } else {
                return responseHeaders;
            }
        }

        @Override public int getStatusCode() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                return super.getStatusCode();
            } else {
                return statusCode;
            }
        }

        @Override public void setResponseHeaders(Map<String, String> headers) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                super.setResponseHeaders(headers);
            } else {
                responseHeaders = headers;
            }
        }

        @Override public void setStatusCodeAndReasonPhrase(int statusCode, String reasonPhrase) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                super.setStatusCodeAndReasonPhrase(statusCode, reasonPhrase);
            } else {
                this.statusCode = statusCode;
                this.reasonPhrase = reasonPhrase;
            }
        }
    }

    public static class WebViewClient {
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return shouldOverrideUrlLoading(view, request.getUrl().toString());
        }

        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return false;
        }

        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            return shouldInterceptRequest(view, request.getUrl().toString());
        }

        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            return null;
        }
    }

    public static class WebChromeClient {
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
        }

        public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
            return false;
        }

        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            return false;
        }

        public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
            return false;
        }

        public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
            return false;
        }

        @TargetApi(Build.VERSION_CODES.LOLLIPOP) public void onPermissionRequest(PermissionRequest request) {
            request.deny();
        }

        public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
            return false;
        }

        @TargetApi(Build.VERSION_CODES.LOLLIPOP) public static class FileChooserParams {
            android.webkit.WebChromeClient.FileChooserParams fileChooserParams;
            private String acceptType;
            private String capture;

            private FileChooserParams(android.webkit.WebChromeClient.FileChooserParams params) {
                fileChooserParams = params;
            }

            private FileChooserParams(String acceptType, String capture) {
                this.acceptType = acceptType;
                this.capture    = capture;
            }

            public static final int MODE_OPEN = 0;
            public static final int MODE_OPEN_MULTIPLE = 1;
            public static final int MODE_OPEN_FOLDER = 2;
            public static final int MODE_SAVE = 3;

            public static Uri[] parseResult(int resultCode, Intent data) {
                // FIXME: Don't delegate if Intent was from createIntent()!
                return android.webkit.WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            }

            public int getMode() {
                if (fileChooserParams != null) {
                    return fileChooserParams.getMode();
                } else {
                    return MODE_OPEN;

                }
            }

            public String[] getAcceptTypes() {
                if (fileChooserParams != null) {
                    return fileChooserParams.getAcceptTypes();
                } else {
                    return new String[] { acceptType };
                }
            }
            public boolean isCaptureEnabled() {
                if (fileChooserParams != null) {
                    return fileChooserParams.isCaptureEnabled();
                } else {
                    return capture != null && !capture.isEmpty();
                }
            }

            public CharSequence getTitle() {
                if (fileChooserParams != null) {
                    return fileChooserParams.getTitle();
                } else {
                    return null;
                }
            }

            public String getFilenameHint() {
                if (fileChooserParams != null) {
                    return fileChooserParams.getFilenameHint();
                } else {
                    return null;
                }
            }

            public Intent createIntent() {
                if (fileChooserParams != null) {
                    return fileChooserParams.createIntent();
                } else {
                    return Intent.createChooser(new Intent(Intent.ACTION_GET_CONTENT)
                                                        .addCategory(Intent.CATEGORY_OPENABLE)
                                                        .setType("*/*"), getTitle());
                }
            }
        }
    }

    public static class JsResult {
        protected android.webkit.JsResult jsResult;
        protected XWalkJavascriptResult xwalkResult;

        private JsResult(android.webkit.JsResult result) {
            jsResult = result;
        }

        private JsResult(XWalkJavascriptResult result) {
            xwalkResult = result;
        }

        public void cancel() {
            if (jsResult != null) {
                jsResult.cancel();
            } else {
                xwalkResult.cancel();
            }
        }

        public void confirm() {
            if (jsResult != null) {
                jsResult.confirm();
            } else {
                xwalkResult.confirm();
            }
        }
    }

    public static class JsPromptResult extends JsResult {
        private JsPromptResult(android.webkit.JsPromptResult result) {
            super(result);
        }

        private JsPromptResult(XWalkJavascriptResult result) {
            super(result);
        }

        public void confirm(String result) {
            if (jsResult != null) {
                ((android.webkit.JsPromptResult) jsResult).confirm(result);
            } else {
                xwalkResult.confirmWithResult(result);
            }
        }
    }
}
