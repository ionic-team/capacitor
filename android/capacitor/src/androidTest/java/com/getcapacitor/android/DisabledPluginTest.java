package com.getcapacitor.android;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import com.getcapacitor.Bridge;
import com.getcapacitor.plugin.CapacitorCookies;
import org.junit.Test;
import org.junit.runner.RunWith;

/** The test host sets plugins.CapacitorCookies.disabled, so the bridge must never register it. */
@RunWith(AndroidJUnit4.class)
public class DisabledPluginTest {

    @Test
    public void doesNotRegisterDisabledPlugins() {
        try (ActivityScenario<TestHostActivity> scenario = ActivityScenario.launch(TestHostActivity.class)) {
            scenario.onActivity((activity) -> {
                Bridge bridge = activity.getBridge();
                assertNotNull(bridge);
                assertNull("disabled core plugin must not be registered", bridge.getPlugin("CapacitorCookies"));
                assertNotNull("plugins that are not disabled must still be registered", bridge.getPlugin("CapacitorHttp"));

                bridge.registerPluginInstance(new CapacitorCookies());
                assertNull("disabled plugin instance must not be registered", bridge.getPlugin("CapacitorCookies"));
            });
        }
    }
}
