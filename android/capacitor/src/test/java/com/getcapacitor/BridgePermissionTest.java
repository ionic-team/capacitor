package com.getcapacitor;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.util.PermissionHelper;
import java.util.Collections;
import java.util.Map;
import org.junit.Test;

public class BridgePermissionTest {

    private Plugin pluginWithLocalNetworkAlias() {
        Permission permission = mock(Permission.class);
        when(permission.alias()).thenReturn("localNetwork");
        when(permission.strings()).thenReturn(new String[] { PermissionHelper.ACCESS_LOCAL_NETWORK });

        CapacitorPlugin annotation = mock(CapacitorPlugin.class);
        when(annotation.permissions()).thenReturn(new Permission[] { permission });

        PluginHandle handle = mock(PluginHandle.class);
        when(handle.getPluginAnnotation()).thenReturn(annotation);

        Plugin plugin = mock(Plugin.class);
        when(plugin.getPluginHandle()).thenReturn(handle);
        return plugin;
    }

    @Test
    public void getPermissionStatesGrantsLocalNetworkWithoutPackageManager() {
        // Unit tests stub Build.VERSION.SDK_INT to 0, exercising the pre-37 path.
        Bridge bridge = mock(Bridge.class);
        Plugin plugin = pluginWithLocalNetworkAlias();
        when(bridge.getPermissionStates(plugin)).thenCallRealMethod();

        Map<String, PermissionState> states = bridge.getPermissionStates(plugin);

        assertEquals(PermissionState.GRANTED, states.get("localNetwork"));
        verify(bridge, never()).getContext();
    }

    @Test
    public void validatePermissionsSwallowsDeniedResultWhenNotEnforced() {
        // Even a DENIED result from the OS must not reject or cache state pre-37.
        Bridge bridge = mock(Bridge.class);
        Context context = mock(Context.class);
        SharedPreferences prefs = mock(SharedPreferences.class);
        PluginCall savedCall = mock(PluginCall.class);
        when(bridge.getContext()).thenReturn(context);
        when(context.getSharedPreferences(anyString(), anyInt())).thenReturn(prefs);
        Map<String, Boolean> results = Collections.singletonMap(PermissionHelper.ACCESS_LOCAL_NETWORK, Boolean.FALSE);
        when(bridge.validatePermissions(any(Plugin.class), eq(savedCall), eq(results))).thenCallRealMethod();

        assertTrue(bridge.validatePermissions(mock(Plugin.class), savedCall, results));

        verifyNoInteractions(savedCall);
        verify(bridge, never()).getActivity();
    }

    @Test
    public void validatePermissionsClearsStaleCacheWhenNotEnforced() {
        Bridge bridge = mock(Bridge.class);
        Context context = mock(Context.class);
        SharedPreferences prefs = mock(SharedPreferences.class);
        SharedPreferences.Editor editor = mock(SharedPreferences.Editor.class);
        PluginCall savedCall = mock(PluginCall.class);
        when(bridge.getContext()).thenReturn(context);
        when(context.getSharedPreferences(anyString(), anyInt())).thenReturn(prefs);
        when(prefs.getString(eq(PermissionHelper.ACCESS_LOCAL_NETWORK), isNull())).thenReturn(PermissionState.DENIED.toString());
        when(prefs.edit()).thenReturn(editor);
        Map<String, Boolean> results = Collections.singletonMap(PermissionHelper.ACCESS_LOCAL_NETWORK, Boolean.TRUE);
        when(bridge.validatePermissions(any(Plugin.class), eq(savedCall), eq(results))).thenCallRealMethod();

        assertTrue(bridge.validatePermissions(mock(Plugin.class), savedCall, results));

        verify(editor).remove(PermissionHelper.ACCESS_LOCAL_NETWORK);
        verify(editor).apply();
        verifyNoInteractions(savedCall);
    }
}
