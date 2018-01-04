package com.avocadojs;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.support.v4.app.ActivityCompat;
import android.util.Log;

import com.avocadojs.android.BuildConfig;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Base class for all plugins
 */
public class Plugin {
  protected Bridge bridge;

  private final Map<String, List<PluginCall>> eventListeners;

  public Plugin() {
    eventListeners = new HashMap<>();
  }

  /**
   * Called when the plugin has been connected to the bridge
   * and is ready to start initializing.
   */
  public void load() {}

  public void setBridge(Bridge bridge) {
    this.bridge = bridge;
  }

  public Context getContext() { return this.bridge.getContext(); }
  public Activity getActivity() { return this.bridge.getActivity(); }

  public String getAppId() {
    return getContext().getPackageName();
  }

  public boolean hasPermission(String permission) {
    return ActivityCompat.checkSelfPermission(this.getContext(), permission) == PackageManager.PERMISSION_GRANTED;
  }

  public void requestPermissions(String[] permissions, int requestCode) {
    ActivityCompat.requestPermissions(getActivity(), permissions, requestCode);
  }

  public void requestPermission(String permission, int requestCode) {
    ActivityCompat.requestPermissions(getActivity(), new String[] { permission }, requestCode);
  }

  /**
   * Add a listener for the given event
   * @param eventName
   * @param call
   */
  private void addEventListener(String eventName, PluginCall call) {
    List<PluginCall> listeners = eventListeners.get(eventName);
    if (listeners == null) {
      listeners = new ArrayList<PluginCall>();
      eventListeners.put(eventName, listeners);
    }
    listeners.add(call);
  }

  /**
   * Remove a listener from the given event
   * @param eventName
   * @param call
   */
  private void removeEventListener(String eventName, PluginCall call) {
    List<PluginCall> listeners = eventListeners.get(eventName);
    if (listeners == null) {
      return;
    }

    listeners.remove(call);
  }

  /**
   * Notify all listeners that an event occurred
   * @param eventName
   * @param data
   */
  protected void notifyListeners(String eventName, JSObject data) {
    Log.d(Bridge.TAG, "Notifying listeners");
    List<PluginCall> listeners = eventListeners.get(eventName);
    if (listeners == null) {
      Log.d(Bridge.TAG, "No listeners found");
      return;
    }

    for(PluginCall call : listeners) {
      call.success(data);
    }
  }


  @SuppressWarnings("unused")
  @PluginMethod(returnType=PluginMethod.RETURN_NONE)
  public void addListener(PluginCall call) {
    String eventName = call.getString("eventName");
    addEventListener(eventName, call);
    call.setSaved(true);
  }

  @SuppressWarnings("unused")
  @PluginMethod(returnType=PluginMethod.RETURN_NONE)
  public void removeListener(PluginCall call) {
    String eventName = call.getString("eventName");
    String callbackId = call.getString("callbackId");
    PluginCall savedCall = bridge.getSavedCall(callbackId);
    if (savedCall != null) {
      removeEventListener(eventName, call);
      bridge.removeSavedCall(callbackId);
    }
  }

  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {}
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {}

  public void execute(Runnable runnable) {
    bridge.execute(runnable);
  }

  protected void log(String... args) {
    StringBuffer b = new StringBuffer();
    int i = 0;
    int l = args.length;
    for(String s : args) {
      b.append(s);
      if(i++ < l) b.append(" ");
    }
    Log.d(Bridge.TAG, b.toString());
  }

}
