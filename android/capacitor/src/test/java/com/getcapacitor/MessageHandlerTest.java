package com.getcapacitor;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import android.webkit.WebView;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebViewFeature;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import org.junit.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

public class MessageHandlerTest {

    @Test
    public void firstSynchronousModernBridgeCallUsesReplyProxyInsteadOfLegacyFallback() throws Exception {
        Bridge bridge = mock(Bridge.class);
        CapConfig config = mock(CapConfig.class);
        WebView webView = mock(WebView.class);
        JavaScriptReplyProxy replyProxy = mock(JavaScriptReplyProxy.class);
        // Avoid the real constructor because it immediately tries to register Android WebView hooks.
        MessageHandler handler = allocateWithoutConstructor(MessageHandler.class);
        String message = "{\"callbackId\":\"91\",\"pluginId\":\"Kiosk\",\"methodName\":\"getFlockContext\",\"options\":{}}";
        CapConfig previousLoggerConfig = Logger.config;

        try (MockedStatic<WebViewFeature> webViewFeature = Mockito.mockStatic(WebViewFeature.class)) {
            Logger.config = config;

            given(config.isLoggingEnabled()).willReturn(false);
            given(config.isUsingLegacyBridge()).willReturn(false);
            given(bridge.getConfig()).willReturn(config);
            given(webView.post(any(Runnable.class))).willAnswer(invocation -> {
                Runnable runnable = invocation.getArgument(0);
                runnable.run();
                return true;
            });
            webViewFeature.when(() -> WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)).thenReturn(true);

            // Because we skipped the constructor, inject only the fields used on the response path.
            setField(MessageHandler.class, handler, "bridge", bridge);
            setField(MessageHandler.class, handler, "webView", webView);

            willAnswer(invocation -> {
                PluginCall call = invocation.getArgument(2);
                call.resolve(new JSObject().put("tabId", "shepherd"));
                return null;
            })
                .given(bridge)
                .callPluginMethod(eq("Kiosk"), eq("getFlockContext"), any(PluginCall.class));

            handler.onModernBridgeMessage(message, replyProxy);

            verify(replyProxy).postMessage(contains("\"callbackId\":\"91\""));
            verify(webView, never()).post(any(Runnable.class));
        } finally {
            Logger.config = previousLoggerConfig;
        }
    }

    private static <T> T allocateWithoutConstructor(Class<T> type) {
        try {
            Class<?> reflectionFactoryClass = Class.forName("sun.reflect.ReflectionFactory");
            Method getReflectionFactory = reflectionFactoryClass.getDeclaredMethod("getReflectionFactory");
            Object reflectionFactory = getReflectionFactory.invoke(null);
            Constructor<Object> objectConstructor = Object.class.getDeclaredConstructor();
            Method newConstructorForSerialization = reflectionFactoryClass.getDeclaredMethod(
                "newConstructorForSerialization",
                Class.class,
                Constructor.class
            );
            Constructor<?> serializationConstructor = (Constructor<?>) newConstructorForSerialization.invoke(
                reflectionFactory,
                type,
                objectConstructor
            );
            serializationConstructor.setAccessible(true);
            return type.cast(serializationConstructor.newInstance());
        } catch (ReflectiveOperationException e) {
            throw new AssertionError(e);
        }
    }

    private static void setField(Class<?> owner, Object target, String name, Object value) {
        try {
            Field field = owner.getDeclaredField(name);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException e) {
            throw new AssertionError(e);
        }
    }
}
