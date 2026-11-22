package com.getcapacitor;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class JSExportTest {

    @Test
    public void getGlobalJSIncludesCapacitorNativeConfigFlags() {
        String js = JSExport.getGlobalJS(null, true, false, true, false);

        assertEquals(
            "window.Capacitor = { DEBUG: false, isLoggingEnabled: true, Plugins: {} }; " +
                "window.CapacitorNativeConfig = { cookiesEnabled: true, httpEnabled: false };",
            js
        );
    }

    @Test
    public void getGlobalJSThreeArgOverloadOmitsCapacitorNativeConfig() {
        String js = JSExport.getGlobalJS(null, false, true);

        assertEquals("window.Capacitor = { DEBUG: true, isLoggingEnabled: false, Plugins: {} };", js);
    }
}
