package com.getcapacitor.plugin;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;

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
  private LocationManager locationManager;
  private LocationListener locationListener;

  Map<String, PluginCall> watchingCalls = new HashMap<>();

  public void load() {
    locationManager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);

    locationListener = new LocationListener() {
      @Override
      public void onLocationChanged(Location location) {
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
    String provider = getBestProviderForCall(call);
    Location lastLocation = getBestLocation(provider);
    if (lastLocation == null) {
      call.error("location unavailable");
    } else {
      call.success(getJSObjectForLocation(lastLocation));
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
    String provider = getBestProviderForCall(call);
    locationManager.requestLocationUpdates(provider, 0, 0, locationListener);

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
      locationManager.removeUpdates(locationListener);
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

  /**
   * Given a call and its options, find the best provider that satisfies those
   * required options.
   * @param call
   * @return
   */
  private String getBestProviderForCall(PluginCall call) {
    Criteria locationCriteria = getCriteriaForCall(call);
    return locationManager.getBestProvider(locationCriteria, true);
  }

  /**
   * Get the best location we can, using the best provider we have available
   * that satisfies the requirements of the client
   * @param bestProvider
   * @return
   */
  @SuppressWarnings("MissingPermission")
  private Location getBestLocation(String bestProvider) {
    List<String> providers = locationManager.getProviders(true);

    Location l = locationManager.getLastKnownLocation(bestProvider);
    Location bestLocation = l;

    if (bestLocation != null) {
      return bestLocation;
    }

    for (String provider : providers) {
      l = locationManager.getLastKnownLocation(provider);
      if (l == null) {
        continue;
      }
      if (bestLocation == null || l.getAccuracy() < bestLocation.getAccuracy()) {
        bestLocation = l;
      }
    }
    return bestLocation;
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

  /**
   * Given the call's options, return a Criteria object
   * that will indicate which location provider we need to use.
   * @param call
   * @return
   */
  private Criteria getCriteriaForCall(PluginCall call) {
    boolean enableHighAccuracy = call.getBoolean("enableHighAccuracy", false);
    boolean altitudeRequired = call.getBoolean("altitudeRequired", false);
    boolean speedRequired = call.getBoolean("speedRequired", false);
    boolean bearingRequired = call.getBoolean("bearingRequired", false);

    int timeout = call.getInt("timeout", 30000);
    int maximumAge = call.getInt("maximumAge", 0);

    Criteria c = new Criteria();
    c.setAccuracy(enableHighAccuracy ? Criteria.ACCURACY_FINE : Criteria.ACCURACY_COARSE);
    c.setAltitudeRequired(altitudeRequired);
    c.setBearingRequired(bearingRequired);
    c.setSpeedRequired(speedRequired);
    return c;
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


}
