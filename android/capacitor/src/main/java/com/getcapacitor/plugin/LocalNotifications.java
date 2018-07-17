package com.getcapacitor.plugin;

import android.content.Intent;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.plugin.notification.LocalNotification;
import com.getcapacitor.plugin.notification.LocalNotificationManager;
import com.getcapacitor.plugin.notification.NotificationAction;
import com.getcapacitor.plugin.notification.NotificationStorage;

import org.json.JSONArray;

import java.util.List;
import java.util.Map;


/**
 * Plugin for scheduling local notifications
 * Plugins allows to create and trigger various types of notifications an specific times
 * Please refer to individual documentation for reference
 */
@NativePlugin()
public class LocalNotifications extends Plugin {

  private LocalNotificationManager manager;
  private NotificationStorage notificationStorage;

  public LocalNotifications() {
  }

  @Override
  public void load() {
    super.load();
    notificationStorage = new NotificationStorage(getContext());
    manager = new LocalNotificationManager(notificationStorage, getActivity());
    manager.createNotificationChannel();
  }

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);
    Log.d(Bridge.TAG, "LocalNotification received: " + data.getDataString());
    // TODO verify what JS expects
    JSObject dataJson = new JSObject();
    dataJson.put("extras", data.getExtras());
    int notificationId = data.getIntExtra(LocalNotificationManager.NOTIFICATION_ID, 0);
    dataJson.put("id", notificationId);
    notificationStorage.deleteNotification(Integer.toString(notificationId));
    notifyListeners("localNotificationReceived", dataJson, true);
  }

  /**
   * Schedule a notification call from JavaScript
   * Creates local notification in system.
   */
  @PluginMethod()
  public void schedule(PluginCall call) {
    List<LocalNotification> localNotifications = LocalNotification.buildNotificationList(call);
    if (localNotifications == null) {
      return;
    }
    JSONArray ids = manager.schedule(call, localNotifications);
    notificationStorage.appendNotificationIds(localNotifications);
    call.success(new JSObject().put("ids", ids));
  }

  @PluginMethod()
  public void cancel(PluginCall call) {
    manager.cancel(call);
  }

  @PluginMethod()
  public void getPending(PluginCall call) {
    List<String> ids = notificationStorage.getSavedNotificationIds();
    JSObject result = LocalNotification.buildLocalNotificationPendingList(ids);
    call.success(result);
  }

  @PluginMethod()
  public void registerActionTypes(PluginCall call) {
    JSArray types = call.getArray("types");
    Map<String, NotificationAction[]> typesArray = NotificationAction.buildTypes(types);
    notificationStorage.writeActionGroup(typesArray);
    call.success();
  }

}

