package com.getcapacitor;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

import android.content.Context;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;

/**
 * Verifies the guard applied to the internal proxy routes in {@link WebViewLocalServer#shouldInterceptRequest}.
 * A blocked request is logged with a warning and gets a 403 response straight away; one that passes the guard
 * logs no warning (the http interceptor route then logs "Handling CapacitorHttp request").
 */
public class WebViewLocalServerProxyGuardTest {

    private static final String FILE_PATH = Bridge.CAPACITOR_FILE_START + "/storage/emulated/0/poc.svg";
    private static final String CONTENT_PATH = Bridge.CAPACITOR_CONTENT_START + "/media/external/images/1";
    private static final String HTTP_PATH = Bridge.CAPACITOR_HTTP_INTERCEPTOR_START + "/";

    private MockedStatic<Uri> uriStatic;
    private MockedStatic<Logger> loggerStatic;
    private WebViewLocalServer server;
    private Bridge bridge;

    @Before
    public void setUp() {
        Uri appOrigin = uri("https", "localhost", -1, "");
        uriStatic = mockStatic(Uri.class);
        uriStatic.when(() -> Uri.parse("https://localhost")).thenReturn(appOrigin);
        loggerStatic = mockStatic(Logger.class);

        PluginConfig httpConfig = mock(PluginConfig.class);
        when(httpConfig.getBoolean("enabled", false)).thenReturn(true);
        CapConfig config = mock(CapConfig.class);
        when(config.getPluginConfiguration("CapacitorHttp")).thenReturn(httpConfig);
        bridge = mock(Bridge.class);
        when(bridge.getLocalUrl()).thenReturn("https://localhost");
        when(bridge.getConfig()).thenReturn(config);

        Context context = mock(Context.class);
        when(context.getApplicationContext()).thenReturn(context);
        server = new WebViewLocalServer(context, bridge, mock(JSInjector.class), new ArrayList<>(), true);
    }

    @After
    public void tearDown() {
        if (loggerStatic != null) loggerStatic.close();
        if (uriStatic != null) uriStatic.close();
        loggerStatic = null;
        uriStatic = null;
    }

    private static Uri uri(String scheme, String host, int port, String path) {
        Uri uri = mock(Uri.class);
        when(uri.getScheme()).thenReturn(scheme);
        when(uri.getHost()).thenReturn(host);
        when(uri.getPort()).thenReturn(port);
        when(uri.getPath()).thenReturn(path);
        return uri;
    }

    private static WebResourceRequest request(Uri uri, boolean mainFrame, Map<String, String> headers) {
        WebResourceRequest request = mock(WebResourceRequest.class);
        when(request.getUrl()).thenReturn(uri);
        when(request.isForMainFrame()).thenReturn(mainFrame);
        when(request.getRequestHeaders()).thenReturn(headers);
        return request;
    }

    private static WebResourceRequest subResource(String host, String path) {
        return request(uri("https", host, -1, path), false, Collections.emptyMap());
    }

    /**
     * A blocked request gets a fixed 403 response with the sandbox header, never null (which would let the WebView
     * send the request to the network itself).
     */
    @SuppressWarnings("unchecked")
    private void assertBlocked(WebResourceRequest request) {
        List<List<?>> constructed = new ArrayList<>();
        try (
            MockedConstruction<WebResourceResponse> ignored = mockConstruction(
                WebResourceResponse.class,
                (mock, context) -> constructed.add(new ArrayList<>(context.arguments()))
            )
        ) {
            assertNotNull(server.shouldInterceptRequest(request));
        }
        assertEquals(1, constructed.size());
        List<?> arguments = constructed.get(0);
        assertEquals(403, arguments.get(2));
        assertEquals("sandbox; frame-ancestors 'none'", ((Map<String, String>) arguments.get(4)).get("Content-Security-Policy"));
        loggerStatic.verify(() -> Logger.warn(anyString()), times(1));
    }

    private void assertNotBlockedByGuard(WebResourceRequest request, String path) {
        assertNull(server.shouldInterceptRequest(request));
        loggerStatic.verify(() -> Logger.warn(anyString()), never());
        if (path.startsWith(Bridge.CAPACITOR_HTTP_INTERCEPTOR_START)) {
            loggerStatic.verify(() -> Logger.debug(anyString()), times(1));
        }
    }

    @Test
    public void allowsSameOriginSubResourceOnEveryProxyRoute() {
        for (String path : new String[] { FILE_PATH, CONTENT_PATH, HTTP_PATH }) {
            setUpFresh();
            assertNotBlockedByGuard(subResource("localhost", path), path);
        }
    }

    @Test
    public void blocksCrossOriginRequestsOnEveryProxyRoute() {
        for (String path : new String[] { FILE_PATH, CONTENT_PATH, HTTP_PATH }) {
            setUpFresh();
            assertBlocked(subResource("evil.example", path));
        }
    }

    @Test
    public void blocksDifferentSchemeOrPortOnEveryProxyRoute() {
        for (String path : new String[] { FILE_PATH, CONTENT_PATH, HTTP_PATH }) {
            setUpFresh();
            assertBlocked(request(uri("http", "localhost", -1, path), false, Collections.emptyMap()));
            setUpFresh();
            assertBlocked(request(uri("https", "localhost", 8080, path), false, Collections.emptyMap()));
        }
    }

    @Test
    public void blocksMainFrameNavigationOnEveryProxyRoute() {
        for (String path : new String[] { FILE_PATH, CONTENT_PATH, HTTP_PATH }) {
            setUpFresh();
            assertBlocked(request(uri("https", "localhost", -1, path), true, Collections.emptyMap()));
        }
    }

    @Test
    public void blocksSubframeDocumentLoadOnEveryProxyRoute() {
        // Iframe, <embed> and <object> navigations are not main-frame requests but send Upgrade-Insecure-Requests.
        Map<String, String> headers = new HashMap<>();
        headers.put("Upgrade-Insecure-Requests", "1");
        for (String path : new String[] { FILE_PATH, CONTENT_PATH, HTTP_PATH }) {
            setUpFresh();
            assertBlocked(request(uri("https", "localhost", -1, path), false, headers));
        }
    }

    @Test
    public void blocksRequestWithoutHost() {
        assertBlocked(request(uri("https", null, -1, FILE_PATH), false, Collections.emptyMap()));
    }

    private void useAppOrigin(String localUrl, String scheme, String host, int port) {
        Uri appOrigin = uri(scheme, host, port, "");
        uriStatic.when(() -> Uri.parse(localUrl)).thenReturn(appOrigin);
        when(bridge.getLocalUrl()).thenReturn(localUrl);
    }

    @Test
    public void treatsAMissingPortAsTheDefaultPortOfAnExplicitAppUrl() {
        // server.url "http://localhost:80": the config keeps the port, the WebView request URL drops it
        useAppOrigin("http://localhost:80", "http", "localhost", 80);
        assertNotBlockedByGuard(request(uri("http", "localhost", -1, FILE_PATH), false, Collections.emptyMap()), FILE_PATH);
        useAppOrigin("https://example.com:443", "https", "example.com", 443);
        assertNotBlockedByGuard(request(uri("https", "example.com", -1, HTTP_PATH), false, Collections.emptyMap()), HTTP_PATH);
    }

    @Test
    public void treatsAnExplicitDefaultPortInTheRequestAsTheAppOriginWithoutPort() {
        assertNotBlockedByGuard(request(uri("https", "localhost", 443, FILE_PATH), false, Collections.emptyMap()), FILE_PATH);
    }

    @Test
    public void stillBlocksANonDefaultPortWhenTheAppUrlHasNone() {
        assertBlocked(request(uri("https", "localhost", 8443, FILE_PATH), false, Collections.emptyMap()));
    }

    @Test
    public void blocksTheOtherSchemeEvenWhenThePortsMatchByDefault() {
        // http://localhost (port 80) is not https://localhost (port 443)
        assertBlocked(request(uri("http", "localhost", 443, FILE_PATH), false, Collections.emptyMap()));
    }

    /** Reset recorded interactions between iterations of the loops above. */
    private void setUpFresh() {
        tearDown();
        setUp();
    }

    private static final String CSP = "sandbox; frame-ancestors 'none'";

    private Map<String, String> securityHeadersFor(String path) {
        Map<String, String> headers = new HashMap<>();
        server.addProxyRouteSecurityHeaders(uri("https", "localhost", -1, path), headers);
        return headers;
    }

    @Test
    public void fileRouteResponsesAreSandboxed() {
        assertEquals(CSP, securityHeadersFor(FILE_PATH).get("Content-Security-Policy"));
    }

    @Test
    public void contentRouteResponsesAreSandboxed() {
        assertEquals(CSP, securityHeadersFor(CONTENT_PATH).get("Content-Security-Policy"));
    }

    @Test
    public void appAssetResponsesAreNotSandboxed() {
        assertTrue(securityHeadersFor("/index.html").isEmpty());
    }
}
