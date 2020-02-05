package com.getcapacitor.plugin;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationAvailability;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;

import java.util.HashMap;
import java.util.Map;


@NativePlugin(
    permissions={
      Manifest.permission.ACCESS_COARSE_LOCATION,
      Manifest.permission.ACCESS_FINE_LOCATION
    },
    permissionRequestCode = PluginRequestCodes.GEOLOCATION_REQUEST_PERMISSIONS
)
public class Geolocation extends Plugin {

  private Map<String, PluginCall> watchingCalls = new HashMap<>();
  private FusedLocationProviderClient fusedLocationClient;
  private LocationCallback locationCallback;


  @PluginMethod()
  public void getCurrentPosition(PluginCall call) {
    if (!hasRequiredPermissions()) {
      saveCall(call);
      pluginRequestAllPermissions();
    } else {
      sendLocation(call);
    }
  }

  private void sendLocation(PluginCall call) {
    requestLocationUpdates(call);
  }

  @PluginMethod(returnType=PluginMethod.RETURN_CALLBACK)
  public void watchPosition(PluginCall call) {
    call.save();
    if (!hasRequiredPermissions()) {
      saveCall(call);
      pluginRequestAllPermissions();
    } else {
      startWatch(call);
    }
  }

  @SuppressWarnings("MissingPermission")
  private void startWatch(PluginCall call) {
    requestLocationUpdates(call);
    watchingCalls.put(call.getCallbackId(), call);
  }

  @SuppressWarnings("MissingPermission")
  @PluginMethod()
  public void clearWatch(PluginCall call) {
    String callbackId = call.getString("id");
    if (callbackId != null) {
      PluginCall removed = watchingCalls.remove(callbackId);
      if (removed != null) {
        removed.release(bridge);
      }
    }
    if (watchingCalls.size() == 0) {
      clearLocationUpdates();
    }
    call.success();
  }

  /**
   * Process a new location item and send it to any listening calls
   * @param location
   */
  private void processLocation(Location location) {
    for (Map.Entry<String, PluginCall> watch : watchingCalls.entrySet()) {
      watch.getValue().success(getJSObjectForLocation(location));
    }
  }

  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    PluginCall savedCall = getSavedCall();
    if (savedCall == null) {
      return;
    }

    for(int result : grantResults) {
      if (result == PackageManager.PERMISSION_DENIED) {
        savedCall.error("User denied location permission");
        return;
      }
    }

    if (savedCall.getMethodName().equals("getCurrentPosition")) {
      sendLocation(savedCall);
    } else if (savedCall.getMethodName().equals("watchPosition")) {
      startWatch(savedCall);
    } else {
      savedCall.resolve();
      savedCall.release(bridge);
    }
  }

  private JSObject getJSObjectForLocation(Location location) {
    JSObject ret = new JSObject();
    JSObject coords = new JSObject();
    ret.put("coords", coords);
    ret.put("timestamp", location.getTime());
    coords.put("latitude", location.getLatitude());
    coords.put("longitude", location.getLongitude());
    coords.put("accuracy", location.getAccuracy());
    coords.put("altitude", location.getAltitude());
    if (Build.VERSION.SDK_INT >= 26) {
      coords.put("altitudeAccuracy", location.getVerticalAccuracyMeters());
    }
    coords.put("speed", location.getSpeed());
    coords.put("heading", location.getBearing());
    return ret;
  }

  @SuppressWarnings("MissingPermission")
  private void requestLocationUpdates(final PluginCall call) {
    clearLocationUpdates();
    boolean enableHighAccuracy = call.getBoolean("enableHighAccuracy", false);
    int timeout = call.getInt("timeout", 10000);
    fusedLocationClient = LocationServices.getFusedLocationProviderClient(getContext());

    LocationRequest locationRequest = new LocationRequest();
    locationRequest.setMaxWaitTime(timeout);
    locationRequest.setInterval(10000);
    locationRequest.setFastestInterval(5000);
    locationRequest.setPriority(enableHighAccuracy ? LocationRequest.PRIORITY_HIGH_ACCURACY : LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY);

    locationCallback = new LocationCallback(){
      @Override
      public void onLocationResult(LocationResult locationResult) {
        if (call.getMethodName().equals("getCurrentPosition")) {
          clearLocationUpdates();
        }
        Location lastLocation = locationResult.getLastLocation();
        if (lastLocation == null) {
          call.error("location unavailable");
        } else {
          call.success(getJSObjectForLocation(lastLocation));
        }
      }
      @Override
      public void onLocationAvailability(LocationAvailability availability) {
        if (!availability.isLocationAvailable()) {
          call.error("location unavailable");
          clearLocationUpdates();
        }
      }
    };

    fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, null);
  }

  private void clearLocationUpdates() {
    if (locationCallback != null) {
      fusedLocationClient.removeLocationUpdates(locationCallback);
      locationCallback = null;
    }
  }

}
