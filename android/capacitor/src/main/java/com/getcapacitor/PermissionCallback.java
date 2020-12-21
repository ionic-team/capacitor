package com.getcapacitor;

import java.util.Map;

/**
 * Represents the callback method called on result of a permission request.
 */
public interface PermissionCallback {
    void onResult(PluginCall call, Map<String, PermissionState> permissionStatus);
}
