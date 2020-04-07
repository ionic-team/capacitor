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
import com.getcapacitor.plugin.notification.NotificationChannelManager;
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
  private NotificationChannelManager notificationChannelManager;

  public LocalNotifications() {
  }

  @Override
  public void load() {
    super.load();
    notificationStorage = new NotificationStorage(getContext());
    manager = new LocalNotificationManager(notificationStorage, getActivity(), getContext());
    manager.createNotificationChannel();
    notificationChannelManager = new NotificationChannelManager(getActivity());
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
    if (ids != null) {
      notificationStorage.appendNotificationIds(localNotifications);
      JSObject result = new JSObject();
      JSArray jsArray = new JSArray();
      for (int i=0; i < ids.length(); i++) {
        try {
          JSObject notification = new JSObject().put("id", ids.getString(i));
          jsArray.put(notification);
        } catch (Exception ex) {
        }
      }
      result.put("notifications", jsArray);
      call.success(result);
    }
  }

  @PluginMethod()
  public void requestPermission(PluginCall call) {
    JSObject result = new JSObject();
    result.put("granted", true);
    call.success(result);
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

  @PluginMethod()
  public void createChannel(PluginCall call) {
    notificationChannelManager.createChannel(call);
  }

  @PluginMethod()
  public void deleteChannel(PluginCall call) {
    notificationChannelManager.deleteChannel(call);
  }

  @PluginMethod()
  public void listChannels(PluginCall call) {
    notificationChannelManager.listChannels(call);
  }

}

