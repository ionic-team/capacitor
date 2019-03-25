package com.getcapacitor.plugin;

import android.content.Intent;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;
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
@NativePlugin(requestCodes = PluginRequestCodes.NOTIFICATION_OPEN)
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
  protected void handleOnNewIntent(Intent data) {
    super.handleOnNewIntent(data);
    if (!Intent.ACTION_MAIN.equals(data.getAction())) {
      return;
    }
    JSObject dataJson = manager.handleNotificationActionPerformed(data, notificationStorage);
    if (dataJson != null) {
      notifyListeners("localNotificationActionPerformed", dataJson, true);
    }
  }

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);
    this.handleOnNewIntent(data);
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

  @PluginMethod()
  public void areEnabled(PluginCall call) {
    JSObject data = new JSObject();
    data.put("value", manager.areNotificationsEnabled());
    call.success(data);
  }

}

