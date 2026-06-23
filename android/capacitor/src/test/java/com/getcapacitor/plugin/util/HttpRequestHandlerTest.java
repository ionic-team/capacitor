package com.getcapacitor.plugin.util;

import static org.junit.Assert.*;

import android.app.Activity;
import com.getcapacitor.Bridge;
import com.getcapacitor.CapConfig;
import com.getcapacitor.JSObject;
import com.getcapacitor.plugin.util.HttpRequestHandler.HttpURLConnectionBuilder;
import java.net.URL;
import org.junit.Test;
import org.mockito.Mockito;

public class HttpRequestHandlerTest {

    static final String BASE_URL = "https://httpbin.org/get";
    static final String PARAMS_JSON = """
        {"k": "a&b"}
        """;

    @Test
    public void testHttpURLConnectionBuilderSetUrlParamsEncoded() throws Exception {
        String expectedQuery = "k=a%26b";
        String expectedUrl = BASE_URL + "?" + expectedQuery;
        String actualUrl = new HttpURLConnectionBuilder()
            .setUrl(new URL(BASE_URL))
            .setUrlParams(new JSObject(PARAMS_JSON), true)
            .url.toString();
        assertEquals(expectedUrl, actualUrl);
    }

    @Test
    public void testHttpURLConnectionBuilderSetUrlParamsNotEncoded() throws Exception {
        String expectedQuery = "k=a&b";
        String expectedUrl = BASE_URL + "?" + expectedQuery;
        String actualUrl = new HttpURLConnectionBuilder()
            .setUrl(new URL(BASE_URL))
            .setUrlParams(new JSObject(PARAMS_JSON), false)
            .url.toString();
        assertEquals(expectedUrl, actualUrl);
    }

    @Test
    public void testApplyDefaultRequestHeadersAddsRefererWhenMissing() {
        Bridge bridge = Mockito.mock(Bridge.class);
        Activity context = Mockito.mock(Activity.class);
        CapConfig config = new CapConfig.Builder(context)
            .setRequestReferer("https://example.com/app")
            .setWebContentsDebuggingEnabled(false)
            .create();

        Mockito.when(bridge.getConfig()).thenReturn(config);

        JSObject headers = new JSObject();
        HttpRequestHandler.applyDefaultRequestHeaders(headers, bridge);

        assertEquals("https://example.com/app", headers.getString("Referer"));
    }

    @Test
    public void testApplyDefaultRequestHeadersDoesNotOverrideReferer() {
        Bridge bridge = Mockito.mock(Bridge.class);
        Activity context = Mockito.mock(Activity.class);
        CapConfig config = new CapConfig.Builder(context)
            .setRequestReferer("https://example.com/app")
            .setWebContentsDebuggingEnabled(false)
            .create();

        Mockito.when(bridge.getConfig()).thenReturn(config);

        JSObject headers = new JSObject();
        headers.put("Referer", "https://request.example/app");
        HttpRequestHandler.applyDefaultRequestHeaders(headers, bridge);

        assertEquals("https://request.example/app", headers.getString("Referer"));
    }

    @Test
    public void testIsValidHttpRefererRejectsInvalidScheme() {
        assertFalse(HttpRequestHandler.isValidHttpReferer("capacitor://localhost"));
    }
}
