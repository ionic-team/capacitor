package com.getcapacitor.plugin;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.util.PermissionHelper;

/**
 * First-party helper exposing the standard checkPermissions()/requestPermissions()
 * flow for Android's local-network runtime permission (ACCESS_LOCAL_NETWORK, API 37+).
 *
 * On older SDKs the Bridge reports the permission as granted, so no prompt ever
 * appears there.
 *
 * @since 9.0.0
 */
@CapacitorPlugin(
    name = "LocalNetwork",
    permissions = { @Permission(alias = "localNetwork", strings = { PermissionHelper.ACCESS_LOCAL_NETWORK }) }
)
public class LocalNetwork extends Plugin {}
