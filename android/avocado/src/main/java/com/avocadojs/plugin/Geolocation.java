package com.avocadojs.plugin;

import android.Manifest;
import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;

import com.avocadojs.JSObject;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;
import com.avocadojs.PluginRequestCodes;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Geolocation plugin that uses the native location service instead of the browser API.
 *
 * https://developer.android.com/guide/topics/location/strategies.html
 */
@NativePlugin(
    permissions={
      Manifest.permission.ACCESS_COARSE_LOCATION,
      Manifest.permission.ACCESS_FINE_LOCATION
    },
    permissionRequestCode = PluginRequestCodes.GEOLOCATION_REQUEST_PERMISSIONS
)
public class Geolocation extends Plugin {
  LocationManager locationManager;
  LocationListener locationListener;

  Map<String, PluginCall> watchingCalls = new HashMap<>();

  public void load() {
    locationManager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);

    locationListener = new LocationListener() {
      @Override
      public void onLocationChanged(Location location) {
        log("LOCATION CHANGED");
        processLocation(location);
      }

      @Override
      public void onStatusChanged(String s, int i, Bundle bundle) {}

      @Override
      public void onProviderEnabled(String s) {}

      @Override
      public void onProviderDisabled(String s) {}
    };
  }

  @SuppressWarnings("MissingPermission")
  @PluginMethod()
  public void getCurrentPosition(PluginCall call) {
    Location lastLocation = getBestLocation();
    if (lastLocation == null) {
      call.success();
    } else {
      call.success(getJSObjectForLocation(lastLocation));
    }
  }

  @SuppressWarnings("MissingPermission")
  @PluginMethod(returnType=PluginMethod.RETURN_CALLBACK)
  public void watchPosition(PluginCall call) {
    log("Watching position...");
    locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, locationListener);

    watchingCalls.put(call.getCallbackId(), call);
    call.retain();
  }

  @SuppressWarnings("MissingPermission")
  @PluginMethod()
  public void clearWatch(PluginCall call) {
    String callbackId = call.getString("id");
    if (callbackId != null) {
      PluginCall removed = watchingCalls.remove(callbackId);
      removed.release(bridge);
    }

    if (watchingCalls.size() == 0) {
      locationManager.removeUpdates(locationListener);
    }

    call.success();
  }

  private void processLocation(Location location) {
    log("Processing new location: " + location.getLatitude() + ", " + location.getLongitude());

    for (Map.Entry<String, PluginCall> watch : watchingCalls.entrySet()) {
      log("Found listener to send data back: " + watch.getValue().getCallbackId());
      watch.getValue().success(getJSObjectForLocation(location));
    }
  }

  @SuppressWarnings("MissingPermission")
  private Location getBestLocation() {
    List<String> providers = locationManager.getProviders(true);

    Location bestLocation = null;
    for (String provider : providers) {
      Location l = locationManager.getLastKnownLocation(provider);
      if (l == null) {
        continue;
      }
      if (bestLocation == null || l.getAccuracy() < bestLocation.getAccuracy()) {
        bestLocation = l;
      }
    }
    return bestLocation;
  }

  private JSObject getJSObjectForLocation(Location location) {
    JSObject ret = new JSObject();
    JSObject coords = new JSObject();
    ret.put("coords", coords);
    coords.put("latitude", location.getLatitude());
    coords.put("longitude", location.getLongitude());
    ret.put("altitude", location.getAltitude());
    ret.put("speed", location.getSpeed());
    ret.put("heading", location.getBearing());
    return ret;
  }


}
