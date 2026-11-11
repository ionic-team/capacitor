package com.getcapacitor.plugin.util;

import static org.junit.Assert.*;

import com.getcapacitor.JSObject;
import com.getcapacitor.plugin.util.HttpRequestHandler.HttpURLConnectionBuilder;
import com.getcapacitor.plugin.util.HttpRequestHandler.ResponseType;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
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

    @Test
    public void testParseJSONKeepsIntegerWithinIntRange() throws Exception {
        assertEquals(42, HttpRequestHandler.parseJSON("42"));
        assertEquals(Integer.MAX_VALUE, HttpRequestHandler.parseJSON("2147483647"));
        assertEquals(Integer.MIN_VALUE, HttpRequestHandler.parseJSON("-2147483648"));
    }

    @Test
    public void testParseJSONReturnsLongBeyondIntRange() throws Exception {
        assertEquals(8000010570L, HttpRequestHandler.parseJSON("8000010570"));
        assertEquals(-8000010570L, HttpRequestHandler.parseJSON("-8000010570"));
        assertEquals(Long.MAX_VALUE, HttpRequestHandler.parseJSON(" 9223372036854775807\n"));
    }

    @Test
    public void testParseJSONReturnsDoubleBeyondLongRange() throws Exception {
        assertEquals(1.2345678901234567e19, HttpRequestHandler.parseJSON("12345678901234567890"));
    }

    @Test
    public void testParseJSONParsesExponent() throws Exception {
        assertEquals(100000.0, HttpRequestHandler.parseJSON("1e5"));
        assertEquals(1500.0, HttpRequestHandler.parseJSON("1.5E+3"));
        assertEquals(-0.0025, HttpRequestHandler.parseJSON("-2.5e-3"));
    }

    @Test
    public void testParseJSONReturnsInputBeyondDoubleRange() throws Exception {
        assertEquals("1e400", HttpRequestHandler.parseJSON("1e400"));
    }

    @Test
    public void testParseJSONKeepsExistingNumberHandling() throws Exception {
        assertEquals(1.5, HttpRequestHandler.parseJSON("1.5"));
        assertEquals(123, HttpRequestHandler.parseJSON("0123"));
    }

    @Test
    public void testParseJSONUnescapesString() throws Exception {
        assertEquals("plain", HttpRequestHandler.parseJSON("\"plain\""));
        assertEquals("a\"b", HttpRequestHandler.parseJSON("\"a\\\"b\""));
        assertEquals("line\nbreak", HttpRequestHandler.parseJSON("\"line\\nbreak\""));
        assertEquals("A/B", HttpRequestHandler.parseJSON("\"\\u0041\\/B\""));
    }

    @Test
    public void testParseJSONKeepsContentBetweenQuotesWhenNotSingleString() throws Exception {
        assertEquals("a\" \"b", HttpRequestHandler.parseJSON("\"a\" \"b\""));
    }

    @Test
    public void testReadDataReturnsJsonNumberBeyondIntRange() throws Exception {
        ICapacitorHttpUrlConnection connection = new ICapacitorHttpUrlConnection() {
            @Override
            public InputStream getErrorStream() {
                return null;
            }

            @Override
            public String getHeaderField(String name) {
                return "Content-Type".equals(name) ? "application/json" : null;
            }

            @Override
            public InputStream getInputStream() {
                return new ByteArrayInputStream("8000010570".getBytes(StandardCharsets.UTF_8));
            }
        };

        assertEquals(8000010570L, HttpRequestHandler.readData(connection, ResponseType.DEFAULT));
    }
}
