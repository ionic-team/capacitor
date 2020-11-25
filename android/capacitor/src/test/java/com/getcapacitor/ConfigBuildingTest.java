package com.getcapacitor;

import static org.junit.Assert.*;

import com.getcapacitor.CapConfig;
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

            config = new CapConfig.ConfigBuilder().pluginConfigurations(pluginConfig).build();
        } catch (Exception e) {
            fail();
        }
    }

    @Test
    public void getPluginString() {
        try {
            String testString = config.getPluginString(TEST_PLUGIN_NAME, "var2");
            assertEquals("hello", testString);
        } catch (Exception e) {
            fail();
        }
    }

    @Test
    public void getPluginBoolean() {
        try {
            boolean testBool = config.getPluginBoolean(TEST_PLUGIN_NAME, "var1", false);
            assertEquals(true, testBool);
        } catch (Exception e) {
            fail();
        }
    }

    @Test
    public void getPluginInt() {
        try {
            int testInt = config.getPluginInt(TEST_PLUGIN_NAME, "var4", -1);
            assertEquals(2, testInt);
        } catch (Exception e) {
            fail();
        }
    }

    @Test
    public void getPluginArray() {
        try {
            String[] comparison = new String[] { "5", "6", "7", "8" };
            String[] testArray = config.getPluginArray(TEST_PLUGIN_NAME, "var5");
            assertArrayEquals(comparison, testArray);
        } catch (Exception e) {
            fail();
        }
    }

    @Test
    public void getPluginObject() {
        try {
            JSONObject testObject = config.getPluginObject(TEST_PLUGIN_NAME, "var3");
            assertEquals(testPluginNestedObject, testObject);
        } catch (Exception e) {
            fail();
        }
    }
}
