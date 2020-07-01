package com.getcapacitor;

import org.junit.Test;

import java.lang.reflect.Method;

import static org.junit.Assert.assertEquals;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

public class PluginMethodHandleTest {
    @Test
    public void getNameReturnsMethodName() {
        PluginMethod pluginMethod = mock(PluginMethod.class);
        Method mockMethod = mock(Method.class);

        given(mockMethod.getName()).willReturn("methodName");
        PluginMethodHandle pluginMethodHandle = new PluginMethodHandle(mockMethod, pluginMethod);

        assertEquals(pluginMethodHandle.getName(), "methodName");
    }

    @Test
    public void getMethodHandleReturnsMethodHandle() {
        PluginMethod pluginMethod = mock(PluginMethod.class);
        Method mockMethod = mock(Method.class);

        given(pluginMethod.returnType()).willReturn("returnType");
        PluginMethodHandle pluginMethodHandle = new PluginMethodHandle(mockMethod, pluginMethod);

        assertEquals(pluginMethodHandle.getReturnType(), "returnType");
    }


    @Test
    public void getMethodReturnsMethod() {
        PluginMethod pluginMethod = mock(PluginMethod.class);
        Method mockMethod = mock(Method.class);

        PluginMethodHandle pluginMethodHandle = new PluginMethodHandle(mockMethod, pluginMethod);

        assertEquals(pluginMethodHandle.getMethod(), mockMethod);
    }
}
