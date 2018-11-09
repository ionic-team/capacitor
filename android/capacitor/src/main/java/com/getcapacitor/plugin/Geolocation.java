package com.getcapacitor.plugin;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Looper;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;
import com.google.android.gms.location.FusedLocationProviderClient;
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
  private FusedLocationProviderClient mFusedLocationClient;
  private LocationCallback locationCallback;

  @PluginMethod()
  public void getCurrentPosition(PluginCall call) {
    if (!hasRequiredPermissions()) {
      saveCall(call);
      pluginRequestAllPermissions();
    } else {
      requestLocationUpdates(call);
      clearLocationUpdates();
    }
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

  @SuppressWarnings("MissingPermission")
  private void requestLocationUpdates(final PluginCall call) {
    mFusedLocationClient = LocationServices.getFusedLocationProviderClient(getContext());

    LocationRequest mLocationRequest;
    mLocationRequest = new LocationRequest();
    mLocationRequest.setInterval(7500);
    mLocationRequest.setFastestInterval(5000);
    mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

    locationCallback = new LocationCallback(){
      @Override
      public void onLocationResult(LocationResult locationResult) {
        for (Location location : locationResult.getLocations()) {
          if (location == null) {
            call.success();
          } else {
            call.success(getJSObjectForLocation(location));
          }
        }
      }
    };

    mFusedLocationClient.requestLocationUpdates(mLocationRequest, locationCallback, Looper.myLooper());
  }
  private void clearLocationUpdates() {
    mFusedLocationClient.removeLocationUpdates(locationCallback);
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
      requestLocationUpdates(savedCall);
      clearLocationUpdates();
    } else {
      startWatch(savedCall);
    }
  }
  private JSObject getJSObjectForLocation(Location location) {
    JSObject ret = new JSObject();
    JSObject coords = new JSObject();
    ret.put("coords", coords);
    coords.put("latitude", location.getLatitude());
    coords.put("longitude", location.getLongitude());
    coords.put("accuracy", location.getAccuracy());
    coords.put("altitude", location.getAltitude());
    coords.put("speed", location.getSpeed());
    coords.put("heading", location.getBearing());
    return ret;
  }
}
