package com.getcapacitor.util;

import static org.junit.Assert.*;

import org.junit.Test;

public class PermissionHelperTest {

    @Test
    public void localNetworkConstants() {
        assertEquals("android.permission.ACCESS_LOCAL_NETWORK", PermissionHelper.ACCESS_LOCAL_NETWORK);
        assertEquals(37, PermissionHelper.ANDROID_API_LOCAL_NETWORK_PERMISSION);
    }

    @Test
    public void isLocalNetworkPermission() {
        assertTrue(PermissionHelper.isLocalNetworkPermission(PermissionHelper.ACCESS_LOCAL_NETWORK));
        assertTrue(PermissionHelper.isLocalNetworkPermission("android.permission.ACCESS_LOCAL_NETWORK"));
        assertFalse(PermissionHelper.isLocalNetworkPermission("android.permission.INTERNET"));
        assertFalse(PermissionHelper.isLocalNetworkPermission("android.permission.CAMERA"));
        assertFalse(PermissionHelper.isLocalNetworkPermission(""));
        assertFalse(PermissionHelper.isLocalNetworkPermission(null));
    }

    @Test
    public void localNetworkNotEnforcedBelowApi37() {
        assertFalse(PermissionHelper.isLocalNetworkPermissionEnforced(24));
        assertFalse(PermissionHelper.isLocalNetworkPermissionEnforced(36));
        assertFalse(PermissionHelper.isPermissionEnforced(PermissionHelper.ACCESS_LOCAL_NETWORK, 24));
        assertFalse(PermissionHelper.isPermissionEnforced(PermissionHelper.ACCESS_LOCAL_NETWORK, 36));
    }

    @Test
    public void localNetworkEnforcedOnApi37Plus() {
        assertTrue(PermissionHelper.isLocalNetworkPermissionEnforced(37));
        assertTrue(PermissionHelper.isLocalNetworkPermissionEnforced(38));
        assertTrue(PermissionHelper.isPermissionEnforced(PermissionHelper.ACCESS_LOCAL_NETWORK, 37));
        assertTrue(PermissionHelper.isPermissionEnforced(PermissionHelper.ACCESS_LOCAL_NETWORK, 38));
    }

    @Test
    public void otherPermissionsAlwaysEnforced() {
        assertTrue(PermissionHelper.isPermissionEnforced("android.permission.INTERNET", 24));
        assertTrue(PermissionHelper.isPermissionEnforced("android.permission.INTERNET", 37));
        assertTrue(PermissionHelper.isPermissionEnforced("android.permission.CAMERA", 24));
        assertTrue(PermissionHelper.isPermissionEnforced("android.permission.CAMERA", 37));
        assertTrue(PermissionHelper.isPermissionEnforced(null, 24));
        assertTrue(PermissionHelper.isPermissionEnforced("", 36));
    }

    @Test
    public void deviceMethodsReflectUnitTestSdk() {
        // Local JVM unit tests stub Build.VERSION.SDK_INT to 0 (pre-37),
        // so the local-network permission must report as not enforced here.
        assertFalse(PermissionHelper.isLocalNetworkPermissionEnforced());
        assertFalse(PermissionHelper.isPermissionEnforced(PermissionHelper.ACCESS_LOCAL_NETWORK));
        assertTrue(PermissionHelper.isPermissionEnforced("android.permission.CAMERA"));
    }
}
