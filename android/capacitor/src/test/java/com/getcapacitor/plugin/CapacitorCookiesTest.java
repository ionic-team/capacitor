package com.getcapacitor.plugin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.webkit.CookieManager;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import org.junit.Test;
import org.mockito.MockedStatic;

public class CapacitorCookiesTest {

    @Test
    public void loadRegistersJavascriptInterfaceWhenBridgeIsUnscoped() {
        Bridge bridge = mock(Bridge.class);
        WebView webView = mock(WebView.class);
        CookieManager webkitCookieManager = mock(CookieManager.class);
        when(bridge.hasScopedWebMessages()).thenReturn(false);
        when(bridge.getWebView()).thenReturn(webView);

        CapacitorCookies plugin = new CapacitorCookies();
        plugin.setBridge(bridge);

        try (MockedStatic<CookieManager> cookieManagerStatic = mockStatic(CookieManager.class)) {
            cookieManagerStatic.when(CookieManager::getInstance).thenReturn(webkitCookieManager);
            plugin.load();
        }

        verify(webView).addJavascriptInterface(eq(plugin), eq("CapacitorCookiesAndroidInterface"));
    }

    @Test
    public void loadSkipsJavascriptInterfaceWhenBridgeHasScopedWebMessages() {
        Bridge bridge = mock(Bridge.class);
        WebView webView = mock(WebView.class);
        CookieManager webkitCookieManager = mock(CookieManager.class);
        when(bridge.hasScopedWebMessages()).thenReturn(true);
        when(bridge.getWebView()).thenReturn(webView);

        CapacitorCookies plugin = new CapacitorCookies();
        plugin.setBridge(bridge);

        try (MockedStatic<CookieManager> cookieManagerStatic = mockStatic(CookieManager.class)) {
            cookieManagerStatic.when(CookieManager::getInstance).thenReturn(webkitCookieManager);
            plugin.load();
        }

        verify(webView, never()).addJavascriptInterface(any(), eq("CapacitorCookiesAndroidInterface"));
    }
}
