package com.getcapacitor.plugin;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

/**
 * Simple Network status plugin.
 *
 * https://developer.android.com/training/monitoring-device-state/connectivity-monitoring.html
 * https://developer.android.com/training/basics/network-ops/managing.html
 */
@NativePlugin(
  permissions={
    Manifest.permission.ACCESS_NETWORK_STATE
  }
)
public class Network extends Plugin {
  public static final String NETWORK_CHANGE_EVENT = "networkStatusChange";
  private static final String PERMISSION_NOT_SET = Manifest.permission.ACCESS_NETWORK_STATE + " not set in AndroidManifest.xml";

  private ConnectivityManager cm;
  private BroadcastReceiver receiver;

  /**
   * Monitor for network status changes and fire our event.
   */
  @SuppressWarnings("MissingPermission")
  public void load() {
    cm = (ConnectivityManager)getContext().getSystemService(Context.CONNECTIVITY_SERVICE);

    receiver = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if (hasRequiredPermissions()) {
          notifyListeners(NETWORK_CHANGE_EVENT, getStatusJSObject(cm.getActiveNetworkInfo()));
        } else {
          Logger.error(getLogTag(), PERMISSION_NOT_SET, null);
        }
      }
    };
  }

  /**
   * Get current network status information
   * @param call
   */
  @SuppressWarnings("MissingPermission")
  @PluginMethod()
  public void getStatus(PluginCall call) {
    if (hasRequiredPermissions()) {
      ConnectivityManager cm =
              (ConnectivityManager)getContext().getSystemService(Context.CONNECTIVITY_SERVICE);

      NetworkInfo activeNetwork = cm.getActiveNetworkInfo();

      call.success(getStatusJSObject(activeNetwork));
    } else {
      call.error(PERMISSION_NOT_SET);
    }
  }

  /**
   * Register the IntentReceiver on resume
   */
  @Override
  protected void handleOnResume() {
    IntentFilter filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
    getActivity().registerReceiver(receiver, filter);
  }

  /**
   * Unregister the IntentReceiver on pause to avoid leaking it
   */
  @Override
  protected void handleOnPause() {
    getActivity().unregisterReceiver(receiver);
  }


  /**
   * Transform a NetworkInfo object into our JSObject for returning to client
   * @param info
   * @return
   */
  private JSObject getStatusJSObject(NetworkInfo info) {
    JSObject ret = new JSObject();
    if (info == null) {
      ret.put("connected", false);
      ret.put("connectionType", "none");
    } else {
      ret.put("connected", info.isConnected());
      ret.put("connectionType", getNormalizedTypeName(info));
    }
    return ret;
  }

  /**
   * Convert the Android-specific naming for network types into our cross-platform type
   * @param info
   * @return
   */
  private String getNormalizedTypeName(NetworkInfo info) {
    String typeName = info.getTypeName();
    if (typeName.equals("WIFI")) {
      return "wifi";
    }
    if (typeName.equals("MOBILE")) {
      return "cellular";
    }
    return "none";
  }
}
