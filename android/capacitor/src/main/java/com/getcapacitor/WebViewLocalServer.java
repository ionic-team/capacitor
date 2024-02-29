/*
Copyright 2015 Google Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
package com.getcapacitor;

import static com.getcapacitor.plugin.util.HttpRequestHandler.isDomainExcludedFromSSL;

import android.content.Context;
import android.net.Uri;
import android.util.Base64;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import com.getcapacitor.plugin.util.CapacitorHttpUrlConnection;
import com.getcapacitor.plugin.util.HttpRequestHandler;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Helper class meant to be used with the android.webkit.WebView class to enable hosting assets,
 * resources and other data on 'virtual' https:// URL.
 * Hosting assets and resources on https:// URLs is desirable as it is compatible with the
 * Same-Origin policy.
 * <p>
 * This class is intended to be used from within the
 * {@link android.webkit.WebViewClient#shouldInterceptRequest(android.webkit.WebView, String)} and
 * {@link android.webkit.WebViewClient#shouldInterceptRequest(android.webkit.WebView,
 * android.webkit.WebResourceRequest)}
 * methods.
 */
public class WebViewLocalServer {

    private static final String capacitorFileStart = Bridge.CAPACITOR_FILE_START;
    private static final String capacitorContentStart = Bridge.CAPACITOR_CONTENT_START;
    private String basePath;

    private final UriMatcher uriMatcher;
    private final AndroidProtocolHandler protocolHandler;
    private final ArrayList<String> authorities;
    private boolean isAsset;
    // Whether to route all requests to paths without extensions back to `index.html`
    private final boolean html5mode;
    private final JSInjector jsInjector;
    private final Bridge bridge;

    /**
     * A handler that produces responses for paths on the virtual asset server.
     * <p>
     * Methods of this handler will be invoked on a background thread and care must be taken to
     * correctly synchronize access to any shared state.
     * <p>
     * On Android KitKat and above these methods may be called on more than one thread. This thread
     * may be different than the thread on which the shouldInterceptRequest method was invoke.
     * This means that on Android KitKat and above it is possible to block in this method without
     * blocking other resources from loading. The number of threads used to parallelize loading
     * is an internal implementation detail of the WebView and may change between updates which
     * means that the amount of time spend blocking in this method should be kept to an absolute
     * minimum.
     */
    public abstract static class PathHandler {

        protected String mimeType;
        private String encoding;
        private String charset;
        private int statusCode;
        private String reasonPhrase;
        private Map<String, String> responseHeaders;

        public PathHandler() {
            this(null, null, 200, "OK", null);
        }

        public PathHandler(String encoding, String charset, int statusCode, String reasonPhrase, Map<String, String> responseHeaders) {
            this.encoding = encoding;
            this.charset = charset;
            this.statusCode = statusCode;
            this.reasonPhrase = reasonPhrase;
            Map<String, String> tempResponseHeaders;
            if (responseHeaders == null) {
                tempResponseHeaders = new HashMap<>();
            } else {
                tempResponseHeaders = responseHeaders;
            }
            tempResponseHeaders.put("Cache-Control", "no-cache");
            this.responseHeaders = tempResponseHeaders;
        }

        public InputStream handle(WebResourceRequest request) {
            return handle(request.getUrl());
        }

        public abstract InputStream handle(Uri url);

        public String getEncoding() {
            return encoding;
        }

        public String getCharset() {
            return charset;
        }

        public int getStatusCode() {
            return statusCode;
        }

        public String getReasonPhrase() {
            return reasonPhrase;
        }

        public Map<String, String> getResponseHeaders() {
            return responseHeaders;
        }
    }

    WebViewLocalServer(Context context, Bridge bridge, JSInjector jsInjector, ArrayList<String> authorities, boolean html5mode) {
        uriMatcher = new UriMatcher(null);
        this.html5mode = html5mode;
        this.protocolHandler = new AndroidProtocolHandler(context.getApplicationContext());
        this.authorities = authorities;
        this.bridge = bridge;
        this.jsInjector = jsInjector;
    }

    private static Uri parseAndVerifyUrl(String url) {
        if (url == null) {
            return null;
        }
        Uri uri = Uri.parse(url);
        if (uri == null) {
            Logger.error("Malformed URL: " + url);
            return null;
        }
        String path = uri.getPath();
        if (path == null || path.isEmpty()) {
            Logger.error("URL does not have a path: " + url);
            return null;
        }
        return uri;
    }

    /**
     * Attempt to retrieve the WebResourceResponse associated with the given <code>request</code>.
     * This method should be invoked from within
     * {@link android.webkit.WebViewClient#shouldInterceptRequest(android.webkit.WebView,
     * android.webkit.WebResourceRequest)}.
     *
     * @param request the request to process.
     * @return a response if the request URL had a matching handler, null if no handler was found.
     */
    public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
        Uri loadingUrl = request.getUrl();

        if (
            null != loadingUrl.getPath() &&
            (
                loadingUrl.getPath().startsWith(Bridge.CAPACITOR_HTTP_INTERCEPTOR_START) ||
                loadingUrl.getPath().startsWith(Bridge.CAPACITOR_HTTPS_INTERCEPTOR_START)
            )
        ) {
            Logger.debug("Handling CapacitorHttp request: " + loadingUrl);
            try {
                return handleCapacitorHttpRequest(request);
            } catch (Exception e) {
                Logger.error(e.getLocalizedMessage());
                return null;
            }
        }

        PathHandler handler;
        synchronized (uriMatcher) {
            handler = (PathHandler) uriMatcher.match(request.getUrl());
        }
        if (handler == null) {
            return null;
        }

        if (isLocalFile(loadingUrl) || isMainUrl(loadingUrl) || !isAllowedUrl(loadingUrl) || isErrorUrl(loadingUrl)) {
            Logger.debug("Handling local request: " + request.getUrl().toString());
            return handleLocalRequest(request, handler);
        } else {
            return handleProxyRequest(request, handler);
        }
    }

    private boolean isLocalFile(Uri uri) {
        String path = uri.getPath();
        return path.startsWith(capacitorContentStart) || path.startsWith(capacitorFileStart);
    }

    private boolean isErrorUrl(Uri uri) {
        String url = uri.toString();
        return url.equals(bridge.getErrorUrl());
    }

    private boolean isMainUrl(Uri loadingUrl) {
        return (bridge.getServerUrl() == null && loadingUrl.getHost().equalsIgnoreCase(bridge.getHost()));
    }

    private boolean isAllowedUrl(Uri loadingUrl) {
        return !(bridge.getServerUrl() == null && !bridge.getAppAllowNavigationMask().matches(loadingUrl.getHost()));
    }

    private String getReasonPhraseFromResponseCode(int code) {
        return switch (code) {
            case 100 -> "Continue";
            case 101 -> "Switching Protocols";
            case 200 -> "OK";
            case 201 -> "Created";
            case 202 -> "Accepted";
            case 203 -> "Non-Authoritative Information";
            case 204 -> "No Content";
            case 205 -> "Reset Content";
            case 206 -> "Partial Content";
            case 300 -> "Multiple Choices";
            case 301 -> "Moved Permanently";
            case 302 -> "Found";
            case 303 -> "See Other";
            case 304 -> "Not Modified";
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 403 -> "Forbidden";
            case 404 -> "Not Found";
            case 405 -> "Method Not Allowed";
            case 406 -> "Not Acceptable";
            case 407 -> "Proxy Authentication Required";
            case 408 -> "Request Timeout";
            case 409 -> "Conflict";
            case 410 -> "Gone";
            case 500 -> "Internal Server Error";
            case 501 -> "Not Implemented";
            case 502 -> "Bad Gateway";
            case 503 -> "Service Unavailable";
            case 504 -> "Gateway Timeout";
            case 505 -> "HTTP Version Not Supported";
            default -> "Unknown";
        };
    }

    private WebResourceResponse handleCapacitorHttpRequest(WebResourceRequest request) throws IOException {
        boolean isHttps =
            request.getUrl().getPath() != null && request.getUrl().getPath().startsWith(Bridge.CAPACITOR_HTTPS_INTERCEPTOR_START);

        String urlString = request
            .getUrl()
            .toString()
            .replace(bridge.getLocalUrl(), isHttps ? "https:/" : "http:/")
            .replace(Bridge.CAPACITOR_HTTP_INTERCEPTOR_START, "")
            .replace(Bridge.CAPACITOR_HTTPS_INTERCEPTOR_START, "");
        urlString = URLDecoder.decode(urlString, "UTF-8");
        URL url = new URL(urlString);
        JSObject headers = new JSObject();

        for (Map.Entry<String, String> header : request.getRequestHeaders().entrySet()) {
            headers.put(header.getKey(), header.getValue());
        }

        HttpRequestHandler.HttpURLConnectionBuilder connectionBuilder = new HttpRequestHandler.HttpURLConnectionBuilder()
            .setUrl(url)
            .setMethod(request.getMethod())
            .setHeaders(headers)
            .openConnection();

        CapacitorHttpUrlConnection connection = connectionBuilder.build();

        if (!isDomainExcludedFromSSL(bridge, url)) {
            connection.setSSLSocketFactory(bridge);
        }

        connection.connect();

        String mimeType = null;
        String encoding = null;
        Map<String, String> responseHeaders = new LinkedHashMap<>();
        for (Map.Entry<String, List<String>> entry : connection.getHeaderFields().entrySet()) {
            StringBuilder builder = new StringBuilder();
            for (String value : entry.getValue()) {
                builder.append(value);
                builder.append(", ");
            }
            builder.setLength(builder.length() - 2);

            if ("Content-Type".equalsIgnoreCase(entry.getKey())) {
                String[] contentTypeParts = builder.toString().split(";");
                mimeType = contentTypeParts[0].trim();
                if (contentTypeParts.length > 1) {
                    String[] encodingParts = contentTypeParts[1].split("=");
                    if (encodingParts.length > 1) {
                        encoding = encodingParts[1].trim();
                    }
                }
            } else {
                responseHeaders.put(entry.getKey(), builder.toString());
            }
        }

        InputStream inputStream = connection.getErrorStream();
        if (inputStream == null) {
            inputStream = connection.getInputStream();
        }

        if (null == mimeType) {
            mimeType = getMimeType(request.getUrl().getPath(), inputStream);
        }

        int responseCode = connection.getResponseCode();
        String reasonPhrase = getReasonPhraseFromResponseCode(responseCode);

        return new WebResourceResponse(mimeType, encoding, responseCode, reasonPhrase, responseHeaders, inputStream);
    }

    private WebResourceResponse handleLocalRequest(WebResourceRequest request, PathHandler handler) {
        String path = request.getUrl().getPath();

        if (request.getRequestHeaders().get("Range") != null) {
            InputStream responseStream = new LollipopLazyInputStream(handler, request);
            String mimeType = getMimeType(path, responseStream);
            Map<String, String> tempResponseHeaders = handler.getResponseHeaders();
            int statusCode = 206;
            try {
                int totalRange = responseStream.available();
                String rangeString = request.getRequestHeaders().get("Range");
                String[] parts = rangeString.split("=");
                String[] streamParts = parts[1].split("-");
                String fromRange = streamParts[0];
                int range = totalRange - 1;
                if (streamParts.length > 1) {
                    range = Integer.parseInt(streamParts[1]);
                }
                tempResponseHeaders.put("Accept-Ranges", "bytes");
                tempResponseHeaders.put("Content-Range", "bytes " + fromRange + "-" + range + "/" + totalRange);
            } catch (IOException e) {
                statusCode = 404;
            }
            return new WebResourceResponse(
                mimeType,
                handler.getEncoding(),
                statusCode,
                handler.getReasonPhrase(),
                tempResponseHeaders,
                responseStream
            );
        }

        if (isLocalFile(request.getUrl()) || isErrorUrl(request.getUrl())) {
            InputStream responseStream = new LollipopLazyInputStream(handler, request);
            String mimeType = getMimeType(request.getUrl().getPath(), responseStream);
            int statusCode = getStatusCode(responseStream, handler.getStatusCode());
            return new WebResourceResponse(
                mimeType,
                handler.getEncoding(),
                statusCode,
                handler.getReasonPhrase(),
                handler.getResponseHeaders(),
                responseStream
            );
        }

        if (path.equals("/cordova.js")) {
            return new WebResourceResponse(
                "application/javascript",
                handler.getEncoding(),
                handler.getStatusCode(),
                handler.getReasonPhrase(),
                handler.getResponseHeaders(),
                null
            );
        }

        if (path.equals("/") || (!request.getUrl().getLastPathSegment().contains(".") && html5mode)) {
            InputStream responseStream;
            try {
                String startPath = this.basePath + "/index.html";
                if (bridge.getRouteProcessor() != null) {
                    ProcessedRoute processedRoute = bridge.getRouteProcessor().process(this.basePath, "/index.html");
                    startPath = processedRoute.getPath();
                    isAsset = processedRoute.isAsset();
                }

                if (isAsset) {
                    responseStream = protocolHandler.openAsset(startPath);
                } else {
                    responseStream = protocolHandler.openFile(startPath);
                }
            } catch (IOException e) {
                Logger.error("Unable to open index.html", e);
                return null;
            }

            responseStream = jsInjector.getInjectedStream(responseStream);

            int statusCode = getStatusCode(responseStream, handler.getStatusCode());
            return new WebResourceResponse(
                "text/html",
                handler.getEncoding(),
                statusCode,
                handler.getReasonPhrase(),
                handler.getResponseHeaders(),
                responseStream
            );
        }

        if ("/favicon.ico".equalsIgnoreCase(path)) {
            try {
                return new WebResourceResponse("image/png", null, null);
            } catch (Exception e) {
                Logger.error("favicon handling failed", e);
            }
        }

        int periodIndex = path.lastIndexOf(".");
        if (periodIndex >= 0) {
            String ext = path.substring(path.lastIndexOf("."));

            InputStream responseStream = new LollipopLazyInputStream(handler, request);

            // TODO: Conjure up a bit more subtlety than this
            if (ext.equals(".html")) {
                responseStream = jsInjector.getInjectedStream(responseStream);
            }

            String mimeType = getMimeType(path, responseStream);
            int statusCode = getStatusCode(responseStream, handler.getStatusCode());
            return new WebResourceResponse(
                mimeType,
                handler.getEncoding(),
                statusCode,
                handler.getReasonPhrase(),
                handler.getResponseHeaders(),
                responseStream
            );
        }

        return null;
    }

    /**
     * Instead of reading files from the filesystem/assets, proxy through to the URL
     * and let an external server handle it.
     * @param request
     * @param handler
     * @return
     */
    private WebResourceResponse handleProxyRequest(WebResourceRequest request, PathHandler handler) {
        final String method = request.getMethod();
        if (method.equals("GET")) {
            try {
                String url = request.getUrl().toString();
                Map<String, String> headers = request.getRequestHeaders();
                boolean isHtmlText = false;
                for (Map.Entry<String, String> header : headers.entrySet()) {
                    if (header.getKey().equalsIgnoreCase("Accept") && header.getValue().toLowerCase().contains("text/html")) {
                        isHtmlText = true;
                        break;
                    }
                }
                if (isHtmlText) {
                    HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                    for (Map.Entry<String, String> header : headers.entrySet()) {
                        conn.setRequestProperty(header.getKey(), header.getValue());
                    }
                    String getCookie = CookieManager.getInstance().getCookie(url);
                    if (getCookie != null) {
                        conn.setRequestProperty("Cookie", getCookie);
                    }
                    conn.setRequestMethod(method);
                    conn.setReadTimeout(30 * 1000);
                    conn.setConnectTimeout(30 * 1000);
                    if (request.getUrl().getUserInfo() != null) {
                        byte[] userInfoBytes = request.getUrl().getUserInfo().getBytes(StandardCharsets.UTF_8);
                        String base64 = Base64.encodeToString(userInfoBytes, Base64.NO_WRAP);
                        conn.setRequestProperty("Authorization", "Basic " + base64);
                    }

                    List<String> cookies = conn.getHeaderFields().get("Set-Cookie");
                    if (cookies != null) {
                        for (String cookie : cookies) {
                            CookieManager.getInstance().setCookie(url, cookie);
                        }
                    }
                    InputStream responseStream = conn.getInputStream();
                    responseStream = jsInjector.getInjectedStream(responseStream);
                    return new WebResourceResponse(
                        "text/html",
                        handler.getEncoding(),
                        handler.getStatusCode(),
                        handler.getReasonPhrase(),
                        handler.getResponseHeaders(),
                        responseStream
                    );
                }
            } catch (Exception ex) {
                bridge.handleAppUrlLoadError(ex);
            }
        }
        return null;
    }

    private String getMimeType(String path, InputStream stream) {
        String mimeType = null;
        try {
            mimeType = URLConnection.guessContentTypeFromName(path); // Does not recognize *.js
            if (mimeType != null && path.endsWith(".js") && mimeType.equals("image/x-icon")) {
                Logger.debug("We shouldn't be here");
            }
            if (mimeType == null) {
                if (path.endsWith(".js") || path.endsWith(".mjs")) {
                    // Make sure JS files get the proper mimetype to support ES modules
                    mimeType = "application/javascript";
                } else if (path.endsWith(".wasm")) {
                    mimeType = "application/wasm";
                } else {
                    mimeType = URLConnection.guessContentTypeFromStream(stream);
                }
            }
        } catch (Exception ex) {
            Logger.error("Unable to get mime type" + path, ex);
        }
        return mimeType;
    }

    private int getStatusCode(InputStream stream, int defaultCode) {
        int finalStatusCode = defaultCode;
        try {
            if (stream.available() == -1) {
                finalStatusCode = 404;
            }
        } catch (IOException e) {
            finalStatusCode = 500;
        }
        return finalStatusCode;
    }

    /**
     * Registers a handler for the given <code>uri</code>. The <code>handler</code> will be invoked
     * every time the <code>shouldInterceptRequest</code> method of the instance is called with
     * a matching <code>uri</code>.
     *
     * @param uri     the uri to use the handler for. The scheme and authority (domain) will be matched
     *                exactly. The path may contain a '*' element which will match a single element of
     *                a path (so a handler registered for /a/* will be invoked for /a/b and /a/c.html
     *                but not for /a/b/b) or the '**' element which will match any number of path
     *                elements.
     * @param handler the handler to use for the uri.
     */
    void register(Uri uri, PathHandler handler) {
        synchronized (uriMatcher) {
            uriMatcher.addURI(uri.getScheme(), uri.getAuthority(), uri.getPath(), handler);
        }
    }

    /**
     * Hosts the application's assets on an https:// URL. Assets from the local path
     * <code>assetPath/...</code> will be available under
     * <code>https://{uuid}.androidplatform.net/assets/...</code>.
     *
     * @param assetPath the local path in the application's asset folder which will be made
     *                  available by the server (for example "/www").
     * @return prefixes under which the assets are hosted.
     */
    public void hostAssets(String assetPath) {
        this.isAsset = true;
        this.basePath = assetPath;
        createHostingDetails();
    }

    /**
     * Hosts the application's files on an https:// URL. Files from the basePath
     * <code>basePath/...</code> will be available under
     * <code>https://{uuid}.androidplatform.net/...</code>.
     *
     * @param basePath the local path in the application's data folder which will be made
     *                  available by the server (for example "/www").
     * @return prefixes under which the assets are hosted.
     */
    public void hostFiles(final String basePath) {
        this.isAsset = false;
        this.basePath = basePath;
        createHostingDetails();
    }

    private void createHostingDetails() {
        final String assetPath = this.basePath;

        if (assetPath.indexOf('*') != -1) {
            throw new IllegalArgumentException("assetPath cannot contain the '*' character.");
        }

        PathHandler handler = new PathHandler() {
            @Override
            public InputStream handle(Uri url) {
                InputStream stream = null;
                String path = url.getPath();

                // Pass path to routeProcessor if present
                RouteProcessor routeProcessor = bridge.getRouteProcessor();
                boolean ignoreAssetPath = false;
                if (routeProcessor != null) {
                    ProcessedRoute processedRoute = bridge.getRouteProcessor().process("", path);
                    path = processedRoute.getPath();
                    isAsset = processedRoute.isAsset();
                    ignoreAssetPath = processedRoute.isIgnoreAssetPath();
                }

                try {
                    if (path.startsWith(capacitorContentStart)) {
                        stream = protocolHandler.openContentUrl(url);
                    } else if (path.startsWith(capacitorFileStart)) {
                        stream = protocolHandler.openFile(path);
                    } else if (!isAsset) {
                        if (routeProcessor == null) {
                            path = basePath + url.getPath();
                        }

                        stream = protocolHandler.openFile(path);
                    } else if (ignoreAssetPath) {
                        stream = protocolHandler.openAsset(path);
                    } else {
                        stream = protocolHandler.openAsset(assetPath + path);
                    }
                } catch (IOException e) {
                    Logger.error("Unable to open asset URL: " + url);
                    return null;
                }

                return stream;
            }
        };

        for (String authority : authorities) {
            registerUriForScheme(Bridge.CAPACITOR_HTTP_SCHEME, handler, authority);
            registerUriForScheme(Bridge.CAPACITOR_HTTPS_SCHEME, handler, authority);

            String customScheme = this.bridge.getScheme();
            if (!customScheme.equals(Bridge.CAPACITOR_HTTP_SCHEME) && !customScheme.equals(Bridge.CAPACITOR_HTTPS_SCHEME)) {
                registerUriForScheme(customScheme, handler, authority);
            }
        }
    }

    private void registerUriForScheme(String scheme, PathHandler handler, String authority) {
        Uri.Builder uriBuilder = new Uri.Builder();
        uriBuilder.scheme(scheme);
        uriBuilder.authority(authority);
        uriBuilder.path("");
        Uri uriPrefix = uriBuilder.build();

        register(Uri.withAppendedPath(uriPrefix, "/"), handler);
        register(Uri.withAppendedPath(uriPrefix, "**"), handler);
    }

    /**
     * The KitKat WebView reads the InputStream on a separate threadpool. We can use that to
     * parallelize loading.
     */
    private abstract static class LazyInputStream extends InputStream {

        protected final PathHandler handler;
        private InputStream is = null;

        public LazyInputStream(PathHandler handler) {
            this.handler = handler;
        }

        private InputStream getInputStream() {
            if (is == null) {
                is = handle();
            }
            return is;
        }

        protected abstract InputStream handle();

        @Override
        public int available() throws IOException {
            InputStream is = getInputStream();
            return (is != null) ? is.available() : -1;
        }

        @Override
        public int read() throws IOException {
            InputStream is = getInputStream();
            return (is != null) ? is.read() : -1;
        }

        @Override
        public int read(byte[] b) throws IOException {
            InputStream is = getInputStream();
            return (is != null) ? is.read(b) : -1;
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            InputStream is = getInputStream();
            return (is != null) ? is.read(b, off, len) : -1;
        }

        @Override
        public long skip(long n) throws IOException {
            InputStream is = getInputStream();
            return (is != null) ? is.skip(n) : 0;
        }
    }

    // For L and above.
    private static class LollipopLazyInputStream extends LazyInputStream {

        private WebResourceRequest request;
        private InputStream is;

        public LollipopLazyInputStream(PathHandler handler, WebResourceRequest request) {
            super(handler);
            this.request = request;
        }

        @Override
        protected InputStream handle() {
            return handler.handle(request);
        }
    }

    public String getBasePath() {
        return this.basePath;
    }
}
