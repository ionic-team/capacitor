package com.getcapacitor.android;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import android.net.Uri;
import android.webkit.WebResourceRequest;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import com.getcapacitor.Bridge;
import java.util.HashMap;
import java.util.Map;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * The proxy path shares the app's host and scheme, so the host/scheme guard alone would let it
 * load in the WebView.
 */
@RunWith(AndroidJUnit4.class)
public class HttpInterceptorNavigationTest {

    private static final String INTERCEPTOR_URL =
        "https://localhost" + Bridge.CAPACITOR_HTTP_INTERCEPTOR_START + "?u=https://example.com/payload.html";
    private static final String IN_APP_URL = "https://localhost/index.html";
    private static final String EXTERNAL_URL = "https://example.com/";

    /** A plugin registered by the test host returns "allow" for the proxy path; it must not win. */
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

    /** An iframe looks like a fetch to isForMainFrame(), so subframe documents must be refused too. */
    @Test
    public void refusesProxyForDocumentRequests() {
        try (ActivityScenario<TestHostActivity> scenario = ActivityScenario.launch(TestHostActivity.class)) {
            scenario.onActivity((activity) -> {
                Bridge bridge = activity.getBridge();
                assertNotNull(bridge);
                // Without this the proxy refuses everything and the assertions below prove nothing.
                assertTrue(
                    "CapacitorHttp must be enabled for this test to mean anything",
                    bridge.getConfig().getPluginConfiguration("CapacitorHttp").getBoolean("enabled", false)
                );

                Map<String, String> navHeaders = new HashMap<>();
                navHeaders.put("Accept", "text/html,application/xhtml+xml");
                navHeaders.put("Upgrade-Insecure-Requests", "1");

                assertNull(
                    "main frame document must be refused",
                    bridge.getLocalServer().shouldInterceptRequest(new FakeRequest(INTERCEPTOR_URL, true, navHeaders))
                );
                assertNull(
                    "iframe document must be refused",
                    bridge.getLocalServer().shouldInterceptRequest(new FakeRequest(INTERCEPTOR_URL, false, navHeaders))
                );
            });
        }
    }

    private static class FakeRequest implements WebResourceRequest {

        private final Uri url;
        private final boolean mainFrame;
        private final Map<String, String> headers;

        FakeRequest(String url, boolean mainFrame, Map<String, String> headers) {
            this.url = Uri.parse(url);
            this.mainFrame = mainFrame;
            this.headers = headers;
        }

        @Override
        public Uri getUrl() {
            return url;
        }

        @Override
        public boolean isForMainFrame() {
            return mainFrame;
        }

        @Override
        public boolean isRedirect() {
            return false;
        }

        @Override
        public boolean hasGesture() {
            return false;
        }

        @Override
        public String getMethod() {
            return "GET";
        }

        @Override
        public Map<String, String> getRequestHeaders() {
            return headers;
        }
    }
}
