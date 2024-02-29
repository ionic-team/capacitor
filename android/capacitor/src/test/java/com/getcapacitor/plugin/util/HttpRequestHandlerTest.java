package com.getcapacitor.plugin.util;

import static org.junit.Assert.*;

import com.getcapacitor.JSObject;
import com.getcapacitor.plugin.util.HttpRequestHandler.HttpURLConnectionBuilder;
import java.net.URL;
import org.junit.Test;

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
}
