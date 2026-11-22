package com.getcapacitor.plugin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.webkit.CookieManager;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.CapConfig;
import com.getcapacitor.PluginConfig;
import java.net.CookieHandler;
import org.junit.Test;
import org.mockito.MockedStatic;

public class CapacitorCookiesTest {

    @Test
    public void loadSkipsJavascriptInterfaceWhenDisabled() {
        verify(loadWithCookiesEnabled(false), never()).addJavascriptInterface(any(), anyString());
    }

    @Test
    public void loadRegistersJavascriptInterfaceWhenEnabled() {
        verify(loadWithCookiesEnabled(true)).addJavascriptInterface(any(CapacitorCookies.class), eq("CapacitorCookiesAndroidInterface"));
    }

    private WebView loadWithCookiesEnabled(boolean enabled) {
        Bridge bridge = mock(Bridge.class);
        WebView webView = mock(WebView.class);
        CapConfig config = mock(CapConfig.class);
        PluginConfig pluginConfig = mock(PluginConfig.class);
        CookieManager webkitCookieManager = mock(CookieManager.class);

        when(bridge.getWebView()).thenReturn(webView);
        when(bridge.getConfig()).thenReturn(config);
        when(config.getPluginConfiguration("CapacitorCookies")).thenReturn(pluginConfig);
        when(pluginConfig.getBoolean("enabled", false)).thenReturn(enabled);

        CookieHandler previous = CookieHandler.getDefault();
        try (MockedStatic<CookieManager> cookieManagerMock = mockStatic(CookieManager.class)) {
            cookieManagerMock.when(CookieManager::getInstance).thenReturn(webkitCookieManager);
            CapacitorCookies plugin = new CapacitorCookies();
            plugin.setBridge(bridge);
            plugin.load();
        } finally {
            CookieHandler.setDefault(previous);
        }

        return webView;
    }
}
