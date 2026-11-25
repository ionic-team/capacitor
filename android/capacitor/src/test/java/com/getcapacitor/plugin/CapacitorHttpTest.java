package com.getcapacitor.plugin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.CapConfig;
import com.getcapacitor.PluginConfig;
import org.junit.Test;

public class CapacitorHttpTest {

    @Test
    public void loadSkipsJavascriptInterfaceWhenDisabled() {
        verify(loadWithHttpEnabled(false), never()).addJavascriptInterface(any(), anyString());
    }

    @Test
    public void loadRegistersJavascriptInterfaceWhenEnabled() {
        verify(loadWithHttpEnabled(true)).addJavascriptInterface(any(CapacitorHttp.class), eq("CapacitorHttpAndroidInterface"));
    }

    private WebView loadWithHttpEnabled(boolean enabled) {
        Bridge bridge = mock(Bridge.class);
        WebView webView = mock(WebView.class);
        CapConfig config = mock(CapConfig.class);
        PluginConfig pluginConfig = mock(PluginConfig.class);

        when(bridge.getWebView()).thenReturn(webView);
        when(bridge.getConfig()).thenReturn(config);
        when(config.getPluginConfiguration("CapacitorHttp")).thenReturn(pluginConfig);
        when(pluginConfig.getBoolean("enabled", false)).thenReturn(enabled);

        CapacitorHttp plugin = new CapacitorHttp();
        plugin.setBridge(bridge);
        plugin.load();

        return webView;
    }
}
