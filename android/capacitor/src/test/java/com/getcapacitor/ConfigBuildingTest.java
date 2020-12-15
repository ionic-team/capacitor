package com.getcapacitor;

import static org.junit.Assert.*;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

public class ConfigBuildingTest {

    final String TEST_PLUGIN_NAME = "TestPlugin";

    JSONObject pluginConfig = new JSONObject();
    JSONObject testPluginObject = new JSONObject();
    JSONObject testPluginNestedObject = new JSONObject();
    JSONArray testPluginArray = new JSONArray();

    CapConfig config = null;

    @Before
    public void setup() {
        try {
            testPluginNestedObject.put("var10", true);

            testPluginArray.put("5");
            testPluginArray.put("6");
            testPluginArray.put("7");
            testPluginArray.put("8");

            testPluginObject.put("var1", true);
            testPluginObject.put("var2", "hello");
            testPluginObject.put("var3", testPluginNestedObject);
            testPluginObject.put("var4", 2);
            testPluginObject.put("var5", testPluginArray);

            pluginConfig.put(TEST_PLUGIN_NAME, testPluginObject);

            config =
                new CapConfig.Builder()
                    .setAllowMixedContent(true)
                    .setAllowNavigation(new String[] { "http://www.google.com" })
                    .setAndroidScheme("test")
                    .setCaptureInput(true)
                    .setLogsHidden(true)
                    .setHTML5mode(false)
                    .setOverriddenUserAgentString("test-user-agent")
                    .setAppendedUserAgentString("test-append")
                    .setWebContentsDebuggingEnabled(true)
                    .setBackgroundColor("red")
                    .setPluginsConfiguration(pluginConfig)
                    .setServerUrl("http://www.google.com")
                    .create();
        } catch (Exception e) {
            fail();
        }
    }

    @Test
    public void getCoreConfigValues() {
        assertTrue(config.isMixedContentAllowed());
        assertArrayEquals(new String[] { "http://www.google.com" }, config.getAllowNavigation());
        assertEquals("test", config.getAndroidScheme());
        assertTrue(config.isInputCaptured());
        assertTrue(config.isLogsHidden());
        assertFalse(config.isHTML5Mode());
        assertEquals("test-user-agent", config.getOverriddenUserAgentString());
        assertEquals("test-append", config.getAppendedUserAgentString());
        assertTrue(config.isWebContentsDebuggingEnabled());
        assertEquals("red", config.getBackgroundColor());
        assertEquals("http://www.google.com", config.getServerUrl());
    }

    @Test
    public void getPluginString() {
        String testString = config.getPluginConfiguration(TEST_PLUGIN_NAME).getString("var2");
        assertEquals("hello", testString);
    }

    @Test
    public void getPluginBoolean() {
        boolean testBool = config.getPluginConfiguration(TEST_PLUGIN_NAME).getBoolean("var1", false);
        assertTrue(testBool);
    }

    @Test
    public void getPluginInt() {
        int testInt = config.getPluginConfiguration(TEST_PLUGIN_NAME).getInt("var4", -1);
        assertEquals(2, testInt);
    }

    @Test
    public void getPluginArray() {
        String[] comparison = new String[] { "5", "6", "7", "8" };
        String[] testArray = config.getPluginConfiguration(TEST_PLUGIN_NAME).getArray("var5");
        assertArrayEquals(comparison, testArray);
    }

    @Test
    public void getPluginObject() {
        JSONObject testObject = config.getPluginConfiguration(TEST_PLUGIN_NAME).getObject("var3");
        assertEquals(testPluginNestedObject, testObject);
    }
}
