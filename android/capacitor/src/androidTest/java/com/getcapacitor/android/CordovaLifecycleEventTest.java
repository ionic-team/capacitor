package com.getcapacitor.android;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * The Cordova compatibility layer forwards Android's pause/resume to the page as document events.
 * The page is not guaranteed to carry the bridge: the injected script is scoped to the app origin,
 * so any other document in the WebView (an allowNavigation origin, the server.errorPath page, or a
 * load that has not finished yet) has no window.Capacitor to call.
 */
@RunWith(AndroidJUnit4.class)
public class CordovaLifecycleEventTest {

    private static final String BRIDGELESS_PAGE = "about:blank";

    /** Reproduces #8637: a pause with no bridge on the page must not throw inside the WebView. */
    @Test
    public void skipsLifecycleEventsWhenBridgeIsAbsent() throws Exception {
        try (ActivityScenario<TestHostActivity> scenario = ActivityScenario.launch(TestHostActivity.class)) {
            RecordingChromeClient console = loadBridgelessPage(scenario);
            assertEquals(
                "the page must not carry the bridge for this test to mean anything",
                "\"undefined\"",
                eval(scenario, "typeof window.Capacitor")
            );

            pauseThenResume(scenario);
            // The events are posted to the main looper, so give them a turn before reading back.
            drain(scenario);

            for (String message : console.messages) {
                if (message.contains("triggerEvent")) {
                    fail("lifecycle event reached a page with no bridge: " + message);
                }
            }
        }
    }

    /** The guard must not cost us the events that a real, loaded page still needs. */
    @Test
    public void stillDeliversLifecycleEventsWhenBridgeIsPresent() throws Exception {
        try (ActivityScenario<TestHostActivity> scenario = ActivityScenario.launch(TestHostActivity.class)) {
            loadBridgelessPage(scenario);
            eval(
                scenario,
                "window.Capacitor = { triggerEvent: function (name, target) {" +
                "  (window.__events = window.__events || []).push(name + ':' + target); return true; } }; true"
            );

            pauseThenResume(scenario);
            drain(scenario);

            String events = eval(scenario, "JSON.stringify(window.__events || [])");
            assertTrue("pause was not delivered, got " + events, events.contains("pause:document"));
            assertTrue("resume was not delivered, got " + events, events.contains("resume:document"));
        }
    }

    private RecordingChromeClient loadBridgelessPage(ActivityScenario<TestHostActivity> scenario) throws Exception {
        RecordingChromeClient console = new RecordingChromeClient();
        scenario.onActivity(activity -> {
            WebView webView = activity.getBridge().getWebView();
            webView.setWebChromeClient(console);
            webView.loadUrl(BRIDGELESS_PAGE);
        });
        awaitPageLoaded(scenario);
        return console;
    }

    private void pauseThenResume(ActivityScenario<TestHostActivity> scenario) {
        scenario.onActivity(activity -> {
            activity.getBridge().onPause();
            activity.getBridge().onResume();
        });
    }

    private void awaitPageLoaded(ActivityScenario<TestHostActivity> scenario) throws Exception {
        for (int attempt = 0; attempt < 100; attempt++) {
            if ("\"complete\"".equals(eval(scenario, "document.readyState"))) {
                return;
            }
            Thread.sleep(100);
        }
        fail("the test page never finished loading");
    }

    /** Lifecycle events go through Handler.post, so round-trip the main looper before asserting. */
    private void drain(ActivityScenario<TestHostActivity> scenario) throws Exception {
        for (int i = 0; i < 5; i++) {
            eval(scenario, "true");
            Thread.sleep(100);
        }
    }

    private String eval(ActivityScenario<TestHostActivity> scenario, String js) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>();
        scenario.onActivity(activity -> {
            WebView webView = activity.getBridge().getWebView();
            webView.evaluateJavascript(js, value -> {
                result.set(value);
                latch.countDown();
            });
        });
        assertTrue("JS evaluation timed out: " + js, latch.await(10, TimeUnit.SECONDS));
        return result.get();
    }

    private static final class RecordingChromeClient extends WebChromeClient {

        final List<String> messages = new CopyOnWriteArrayList<>();

        @Override
        public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
            messages.add(consoleMessage.messageLevel().name() + ": " + consoleMessage.message());
            return true;
        }
    }
}
