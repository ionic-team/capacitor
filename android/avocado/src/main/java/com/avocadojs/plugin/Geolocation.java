package com.avocadojs.plugin;

import android.Manifest;

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginRequestCodes;

@NativePlugin(
    permissions={
      Manifest.permission.ACCESS_COARSE_LOCATION,
      Manifest.permission.ACCESS_FINE_LOCATION
    },
    permissionRequestCode = PluginRequestCodes.GEOLOCATION_REQUEST_PERMISSIONS
)
public class Geolocation extends Plugin {
}
