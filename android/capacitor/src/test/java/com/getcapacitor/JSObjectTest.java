package com.getcapacitor;

import org.json.JSONException;
import org.junit.Test;

import static org.junit.Assert.*;

public class JSObjectTest {

    @Test
    public void getStringReturnsNull_WhenJSObject_IsConstructed_WithNoInitialJSONObject() {
        JSObject jsObject = new JSObject();

        String actualValue = jsObject.getString("should be null");

        assertNull(actualValue);
    }

    @Test
    public void getStringReturnsExpectedValue_WhenJSObject_IsConstructed_WithAValidJSONObject() throws JSONException {
        JSObject jsObject = new JSObject("{\"thisKeyExists\": \"this is the key value\"}");

        String expectedValue = jsObject.getString("thisKeyExists");
        String actualValue = "this is the key value";

        assertEquals(expectedValue, actualValue);
    }

    @Test
    public void getStringReturnsDefaultValue_WhenJSObject_IsConstructed_WithNoInitialJSONObject() throws JSONException {
        JSObject jsObject = new JSObject();

        String expectedValue = jsObject.getString("thisKeyDoesNotExist", "default value");
        String actualValue = "default value";

        assertEquals(expectedValue, actualValue);
    }

    @Test
    public void getStringReturnsDefaultValue_WhenJSObject_IsConstructed_WithAValueAsInteger() throws JSONException {
        JSObject jsObject = new JSObject("{\"thisKeyExists\": 1}");

        String expectedValue = jsObject.getString("thisKeyExists", "default value");
        String actualValue = "default value";

        assertEquals(expectedValue, actualValue);
    }

    @Test
    public void getIntegerReturnsNull_WhenJSObject_IsConstructed_WithNoInitialJSONObject() {
        JSObject jsObject = new JSObject();

        Integer actualValue = jsObject.getInteger("should be null");

        assertNull(actualValue);
    }

    @Test
    public void getIntegerReturnsExpectedValue_WhenJSObject_IsConstructed_WithAValidJSONObject() throws JSONException {
        JSObject jsObject = new JSObject("{\"thisKeyExists\": 1}");

        Integer expectedValue = jsObject.getInteger("thisKeyExists");
        Integer actualValue = 1;

        assertEquals(expectedValue, actualValue);
    }

    @Test
    public void getIntegerReturnsDefaultValue_WhenJSObject_IsConstructed_WithNoInitialJSONObject() throws JSONException {
        JSObject jsObject = new JSObject();

        Integer expectedValue = jsObject.getInteger("thisKeyDoesNotExist", 1);
        Integer actualValue = 1;

        assertEquals(expectedValue, actualValue);
    }

    @Test
    public void getStringReturnsDefaultValue_WhenJSObject_IsConstructed_WithAValueAsString() throws JSONException {
        JSObject jsObject = new JSObject("{\"thisKeyExists\": \"not an integer\"}");

        Integer expectedValue = jsObject.getInteger("thisKeyExists", 1);
        Integer actualValue = 1;

        assertEquals(expectedValue, actualValue);
    }

    @Test
    public void getBoolReturnsNull_WhenJSObject_IsConstructed_WithNoInitialJSONObject() {
        JSObject jsObject = new JSObject();

        Boolean actualValue = jsObject.getBool("should be null");

        assertNull(actualValue);
    }

    @Test
    public void getBoolReturnsExpectedValue_WhenJSObject_IsConstructed_WithAValidJSONObject() throws JSONException {
        JSObject jsObject = new JSObject("{\"thisKeyExists\": true}");

        Boolean expectedValue = jsObject.getBool("thisKeyExists");
        Boolean actualValue = true;

        assertEquals(expectedValue, actualValue);
    }

    @Test
    public void getBooleanReturnsDefaultValue_WhenJSObject_IsConstructed_WithNoInitialJSONObject() throws JSONException {
        JSObject jsObject = new JSObject();

        Boolean expectedValue = jsObject.getBoolean("thisKeyDoesNotExist", true);
        Boolean actualValue = true;

        assertEquals(expectedValue, actualValue);
    }

    @Test
    public void getBooleanReturnsDefaultValue_WhenJSObject_IsConstructed_WithAValueAsString() throws JSONException {
        JSObject jsObject = new JSObject("{\"thisKeyExists\": \"not an integer\"}");

        Boolean expectedValue = jsObject.getBoolean("thisKeyExists", true);
        Boolean actualValue = true;

        assertEquals(expectedValue, actualValue);
    }

    @Test
    public void getJSObjectReturnsNull_WhenJSObject_IsConstructed_WithNoInitialJSONObject() {
        JSObject jsObject = new JSObject();

        JSObject actualValue = jsObject.getJSObject("should be null");

        assertNull(actualValue);
    }

    @Test
    public void getJsObjectReturnsExpectedValue_WhenJSObject_IsConstructed_WithAValidJSONObject() throws JSONException {
        JSObject jsObject = new JSObject("{\"thisKeyExists\": { \"innerObjectKey\": \"innerObjectValue\" }}");

        String actualValue = jsObject.getJSObject("thisKeyExists").getString("innerObjectKey");
        String expectedValue = "innerObjectValue";

        assertEquals(expectedValue,  actualValue);
    }

    @Test
    public void getJSObjectReturnsDefaultValue_WhenJSObject_IsConstructed_WithNoInitialJSONObject() throws JSONException {
        JSObject jsObject = new JSObject();

        String actualValue = jsObject.getJSObject("thisKeyExists", new JSObject("{\"thisKeyExists\": \"default string\"}")).getString("thisKeyExists");
        String expectedValue = "default string";

        assertEquals(expectedValue,  actualValue);
    }

    @Test
    public void putBoolean_AddsValueToJSObject_UnderCorrectKey() {
        JSObject jsObject = new JSObject();
        jsObject.put("bool", true);

        Boolean actualValue = jsObject.getBool("bool");

        assertTrue(actualValue);
    }

    @Test
    public void putInteger_AddsValueToJSObject_UnderCorrectKey() {
        JSObject jsObject = new JSObject();
        jsObject.put("integer", 1);

        Integer expectedValue = 1;
        Integer actualValue = jsObject.getInteger("integer");

        assertEquals(actualValue, expectedValue);
    }

    @Test
    public void putLong_AddsValueToJSObject_UnderCorrectKey() throws JSONException {
        JSObject jsObject = new JSObject();
        jsObject.put("long", 1l);

        Long expectedValue = 1l;
        Long actualValue = jsObject.getLong("long");

        assertEquals(actualValue, expectedValue);
    }

    @Test
    public void putDouble_AddsValueToJSObject_UnderCorrectKey() throws JSONException {
        JSObject jsObject = new JSObject();
        jsObject.put("double", 1d);

        Double expectedValue = 1d;
        Double actualValue = jsObject.getDouble("double");

        assertEquals(actualValue, expectedValue);
    }

    @Test
    public void putString_AddsValueToJSObject_UnderCorrectKey() throws JSONException {
        JSObject jsObject = new JSObject();
        jsObject.put("string", "test");

        String expectedValue = "test";
        String actualValue = jsObject.getString("string");

        assertEquals(actualValue, expectedValue);
    }
}
