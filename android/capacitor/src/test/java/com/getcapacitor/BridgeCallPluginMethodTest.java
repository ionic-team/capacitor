package com.getcapacitor;

import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doCallRealMethod;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.os.Handler;
import java.lang.reflect.Field;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;

/**
 * C-006: InvalidPluginMethodException / PluginLoadException during invoke must reject the JS call.
 */
public class BridgeCallPluginMethodTest {

    // android.util.Log is not available in the JVM mockable jar; silence Logger
    private MockedStatic<Logger> loggerMock;

    @Before
    public void setUp() {
        loggerMock = org.mockito.Mockito.mockStatic(Logger.class);
    }

    @After
    public void tearDown() {
        loggerMock.close();
    }

    @Test
    public void invalidPluginMethodCallsErrorCallback() throws Exception {
        MessageHandler msgHandler = mock(MessageHandler.class);
        PluginCall call = spy(new PluginCall(msgHandler, "TestPlugin", "cb1", "typoMethod", new JSObject()));

        PluginHandle pluginHandle = mock(PluginHandle.class);
        String errorMessage = "No method typoMethod found for plugin com.example.TestPlugin";
        doThrow(new InvalidPluginMethodException(errorMessage)).when(pluginHandle).invoke(eq("typoMethod"), eq(call));

        Bridge bridge = mock(Bridge.class);
        when(bridge.getPlugin("TestPlugin")).thenReturn(pluginHandle);
        setSyncTaskHandler(bridge);

        doCallRealMethod().when(bridge).callPluginMethod("TestPlugin", "typoMethod", call);

        bridge.callPluginMethod("TestPlugin", "typoMethod", call);

        ArgumentCaptor<String> msg = ArgumentCaptor.forClass(String.class);
        verify(call).errorCallback(msg.capture());
        assertTrue(msg.getValue().contains("typoMethod"));
    }

    @Test
    public void pluginLoadExceptionCallsErrorCallback() throws Exception {
        MessageHandler msgHandler = mock(MessageHandler.class);
        PluginCall call = spy(new PluginCall(msgHandler, "TestPlugin", "cb2", "getInfo", new JSObject()));

        PluginHandle pluginHandle = mock(PluginHandle.class);
        String errorMessage = "Unable to load plugin instance";
        doThrow(new PluginLoadException(errorMessage)).when(pluginHandle).invoke(eq("getInfo"), eq(call));

        Bridge bridge = mock(Bridge.class);
        when(bridge.getPlugin("TestPlugin")).thenReturn(pluginHandle);
        setSyncTaskHandler(bridge);

        doCallRealMethod().when(bridge).callPluginMethod("TestPlugin", "getInfo", call);

        bridge.callPluginMethod("TestPlugin", "getInfo", call);

        ArgumentCaptor<String> msg = ArgumentCaptor.forClass(String.class);
        verify(call).errorCallback(msg.capture());
        assertTrue(msg.getValue().contains("Unable to load plugin instance"));
    }

    private static void setSyncTaskHandler(Bridge bridge) throws Exception {
        Handler syncHandler = mock(Handler.class);
        doAnswer(invocation -> {
            Runnable runnable = invocation.getArgument(0);
            runnable.run();
            return true;
        })
            .when(syncHandler)
            .post(any(Runnable.class));

        Field taskHandlerField = Bridge.class.getDeclaredField("taskHandler");
        taskHandlerField.setAccessible(true);
        taskHandlerField.set(bridge, syncHandler);
    }
}
