package com.getcapacitor.plugin;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.util.PermissionHelper;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

public class LocalNetworkTest {

    @Test
    public void annotatedWithLocalNetworkPermission() {
        CapacitorPlugin annotation = LocalNetwork.class.getAnnotation(CapacitorPlugin.class);

        assertNotNull(annotation);
        assertEquals("LocalNetwork", annotation.name());

        Permission[] permissions = annotation.permissions();
        assertEquals(1, permissions.length);
        assertEquals("localNetwork", permissions[0].alias());
        assertArrayEquals(new String[] { PermissionHelper.ACCESS_LOCAL_NETWORK }, permissions[0].strings());
    }

    @Test
    public void checkPermissionsReportsGrantedOnPreApi37() {
        // Local JVM unit tests stub Build.VERSION.SDK_INT to 0, exercising the pre-37 path:
        // the bridge must report the localNetwork alias as GRANTED without touching
        // PackageManager (no getContext call), so no prompt can ever appear.
        // CALLS_REAL_METHODS runs Bridge.getPermissionStates() for real while
        // keeping the rest of the mock inert (the pre-37 path never reaches them).
        Bridge bridge = mock(Bridge.class, CALLS_REAL_METHODS);

        PluginHandle handle = mock(PluginHandle.class);
        when(handle.getPluginAnnotation()).thenReturn(LocalNetwork.class.getAnnotation(CapacitorPlugin.class));

        LocalNetwork plugin = new LocalNetwork();
        plugin.setBridge(bridge);
        plugin.setPluginHandle(handle);

        PluginCall call = mock(PluginCall.class);
        plugin.checkPermissions(call);

        ArgumentCaptor<JSObject> captor = ArgumentCaptor.forClass(JSObject.class);
        verify(call).resolve(captor.capture());
        assertEquals(PermissionState.GRANTED.toString(), captor.getValue().optString("localNetwork", "missing"));
        verify(bridge, never()).getContext();
    }
}