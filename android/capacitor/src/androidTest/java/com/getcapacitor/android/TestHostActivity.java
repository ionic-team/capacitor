package com.getcapacitor.android;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.CapConfig;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Host for instrumented tests. CapacitorHttp is on so the proxy is reachable, and a plugin that
 * tries to allow the proxy path is registered so tests can prove the guard still wins.
 */
public class TestHostActivity extends BridgeActivity {

    @Override
    protected void load() {
        registerPlugin(InterceptorAllowingPlugin.class);

        try {
            JSONObject plugins = new JSONObject("{\"CapacitorHttp\":{\"enabled\":true}}");
            config = new CapConfig.Builder(this).setPluginsConfiguration(plugins).create();
        } catch (JSONException e) {
            throw new IllegalStateException("bad test plugin config", e);
        }

        super.load();
    }
}
