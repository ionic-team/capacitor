package com.getcapacitor.android;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import android.net.Uri;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import com.getcapacitor.Bridge;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * A frame navigation to the internal HTTP proxy path must be blocked. Because the app is served at
 * https://localhost, such a URL shares the app's host and scheme, so the host/scheme navigation
 * guard alone would keep it in the WebView and render proxied content at the app origin.
 */
@RunWith(AndroidJUnit4.class)
public class HttpInterceptorNavigationTest {

    private static final String INTERCEPTOR_URL =
        "https://localhost" + Bridge.CAPACITOR_HTTP_INTERCEPTOR_START + "?u=https://example.com/payload.html";
    private static final String IN_APP_URL = "https://localhost/index.html";
    private static final String EXTERNAL_URL = "https://example.com/";

    @Test
    public void blocksNavigationToInterceptorPath() {
        try (ActivityScenario<TestHostActivity> scenario = ActivityScenario.launch(TestHostActivity.class)) {
            scenario.onActivity((activity) -> {
                Bridge bridge = activity.getBridge();
                assertNotNull(bridge);
                assertTrue("interceptor navigation must be blocked", bridge.launchIntent(Uri.parse(INTERCEPTOR_URL)));
                assertFalse("in-app navigation must stay in the WebView", bridge.launchIntent(Uri.parse(IN_APP_URL)));
                assertTrue("external navigation must leave the WebView", bridge.launchIntent(Uri.parse(EXTERNAL_URL)));
            });
        }
    }
}
