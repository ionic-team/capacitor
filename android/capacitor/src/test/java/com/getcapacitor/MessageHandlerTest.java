package com.getcapacitor;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.net.Uri;
import android.webkit.WebView;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;

public class MessageHandlerTest {

    private static final String TRUSTED_ORIGIN = "https://app.example.com";
    private static final String UNTRUSTED_ORIGIN = "https://auth.example.com";

    @Test
    public void scopedPolicyDispatchesOnlyTrustedMainFrameAndUsesReplyProxy() {
        WebView webView = mock(WebView.class);
        Bridge bridge = mock(Bridge.class);
        JavaScriptReplyProxy replyProxy = mock(JavaScriptReplyProxy.class);
        PluginCall call = mock(PluginCall.class);
        when(call.getCallbackId()).thenReturn("cb-1");
        when(call.getPluginId()).thenReturn("Echo");
        when(call.getMethodName()).thenReturn("ping");
        when(call.isKeptAlive()).thenReturn(false);

        Set<String> scopedRules = Collections.singleton(TRUSTED_ORIGIN);
        List<String> dispatched = new ArrayList<>();

        Uri trustedUri = mockOrigin(TRUSTED_ORIGIN);
        Uri untrustedUri = mockOrigin(UNTRUSTED_ORIGIN);
        WebMessageCompat iframeMsg = mockMessage("iframe");
        WebMessageCompat untrustedMsg = mockMessage("untrusted");
        WebMessageCompat nullOriginMsg = mockMessage("null-origin");
        WebMessageCompat trustedMsg = mockMessage("trusted");

        try (MockedStatic<Uri> uriStatic = mockStatic(Uri.class)) {
            uriStatic.when(() -> Uri.parse(anyString())).thenAnswer((inv) -> mockOrigin(inv.getArgument(0)));
            try (
                MockedStatic<WebViewFeature> webViewFeature = mockStatic(WebViewFeature.class);
                MockedStatic<WebViewCompat> webViewCompat = mockStatic(WebViewCompat.class);
                MockedStatic<Logger> logger = mockStatic(Logger.class)
            ) {
                webViewFeature.when(() -> WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)).thenReturn(true);

                ArgumentCaptor<WebViewCompat.WebMessageListener> listenerCaptor = ArgumentCaptor.forClass(
                    WebViewCompat.WebMessageListener.class
                );

                new MessageHandler(
                    bridge,
                    webView,
                    null,
                    new MessageHandler.WebMessagePolicy(scopedRules, (origin) -> TRUSTED_ORIGIN.equals(origin.toString()))
                ) {
                    @Override
                    public void postMessage(String jsonStr) {
                        dispatched.add(jsonStr);
                        sendResponseMessage(call, new PluginResult(), null);
                    }
                };

                webViewCompat.verify(() ->
                    WebViewCompat.addWebMessageListener(eq(webView), eq("androidBridge"), eq(scopedRules), listenerCaptor.capture())
                );
                verify(webView, never()).addJavascriptInterface(any(), anyString());

                WebViewCompat.WebMessageListener listener = listenerCaptor.getValue();
                assertNotNull(listener);

                listener.onPostMessage(webView, iframeMsg, trustedUri, false, replyProxy);
                listener.onPostMessage(webView, untrustedMsg, untrustedUri, true, replyProxy);
                listener.onPostMessage(webView, nullOriginMsg, null, true, replyProxy);
                listener.onPostMessage(webView, trustedMsg, trustedUri, true, replyProxy);

                assertEquals(Collections.singletonList("trusted"), dispatched);
                verify(replyProxy).postMessage(anyString());
                verify(webView, never()).post(any());
            }
        }
    }

    @Test
    public void scopedPolicyDoesNotExposeLegacyInterfaceWhenFeatureUnsupported() {
        WebView webView = mock(WebView.class);
        Bridge bridge = mock(Bridge.class);
        PluginCall call = mock(PluginCall.class);
        when(call.getCallbackId()).thenReturn("cb-1");
        when(call.getPluginId()).thenReturn("Echo");
        when(call.getMethodName()).thenReturn("ping");
        when(call.isKeptAlive()).thenReturn(false);

        try (MockedStatic<Uri> uriStatic = mockStatic(Uri.class)) {
            uriStatic.when(() -> Uri.parse(anyString())).thenAnswer((inv) -> mockOrigin(inv.getArgument(0)));
            try (
                MockedStatic<WebViewFeature> webViewFeature = mockStatic(WebViewFeature.class);
                MockedStatic<WebViewCompat> webViewCompat = mockStatic(WebViewCompat.class);
                MockedStatic<Logger> logger = mockStatic(Logger.class)
            ) {
                webViewFeature.when(() -> WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)).thenReturn(false);

                MessageHandler handler = new MessageHandler(
                    bridge,
                    webView,
                    null,
                    new MessageHandler.WebMessagePolicy(Collections.singleton(TRUSTED_ORIGIN), (origin) -> true)
                );
                handler.sendResponseMessage(call, new PluginResult(), null);

                webViewCompat.verifyNoInteractions();
                verify(webView, never()).addJavascriptInterface(any(), anyString());
                verify(webView, never()).post(any());
            }
        }
    }

    @Test
    public void scopedPolicyDoesNotExposeLegacyInterfaceWhenRegistrationFails() {
        WebView webView = mock(WebView.class);
        Bridge bridge = mock(Bridge.class);
        Set<String> scopedRules = new LinkedHashSet<>(Collections.singletonList(TRUSTED_ORIGIN));

        try (MockedStatic<Uri> uriStatic = mockStatic(Uri.class)) {
            uriStatic.when(() -> Uri.parse(anyString())).thenAnswer((inv) -> mockOrigin(inv.getArgument(0)));
            try (
                MockedStatic<WebViewFeature> webViewFeature = mockStatic(WebViewFeature.class);
                MockedStatic<WebViewCompat> webViewCompat = mockStatic(WebViewCompat.class);
                MockedStatic<Logger> logger = mockStatic(Logger.class)
            ) {
                webViewFeature.when(() -> WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)).thenReturn(true);
                webViewCompat
                    .when(() -> WebViewCompat.addWebMessageListener(eq(webView), eq("androidBridge"), eq(scopedRules), any()))
                    .thenThrow(new IllegalArgumentException("Invalid origin rule"));

                new MessageHandler(
                    bridge,
                    webView,
                    null,
                    new MessageHandler.WebMessagePolicy(scopedRules, (origin) -> TRUSTED_ORIGIN.equals(origin.toString()))
                );

                verify(webView, never()).addJavascriptInterface(any(), anyString());
            }
        }
    }

    @Test
    public void scopedPolicySkipsRegistrationWhenOriginRulesAreEmpty() {
        WebView webView = mock(WebView.class);
        Bridge bridge = mock(Bridge.class);

        try (MockedStatic<Uri> uriStatic = mockStatic(Uri.class)) {
            uriStatic.when(() -> Uri.parse(anyString())).thenAnswer((inv) -> mockOrigin(inv.getArgument(0)));
            try (
                MockedStatic<WebViewFeature> webViewFeature = mockStatic(WebViewFeature.class);
                MockedStatic<WebViewCompat> webViewCompat = mockStatic(WebViewCompat.class);
                MockedStatic<Logger> logger = mockStatic(Logger.class)
            ) {
                webViewFeature.when(() -> WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)).thenReturn(true);

                new MessageHandler(bridge, webView, null, new MessageHandler.WebMessagePolicy(Collections.emptySet(), (origin) -> false));

                webViewCompat.verifyNoInteractions();
                verify(webView, never()).addJavascriptInterface(any(), anyString());
            }
        }
    }

    private static Uri mockOrigin(String origin) {
        Uri uri = mock(Uri.class);
        when(uri.toString()).thenReturn(origin);
        return uri;
    }

    private static WebMessageCompat mockMessage(String payload) {
        WebMessageCompat message = mock(WebMessageCompat.class);
        when(message.getData()).thenReturn(payload);
        return message;
    }
}
