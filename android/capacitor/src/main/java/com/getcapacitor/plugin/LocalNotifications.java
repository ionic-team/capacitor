package com.getcapacitor.plugin;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.plugin.notification.Notification;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;


/**
 * Plugin for creating local notification
 */
@NativePlugin()
public class LocalNotifications extends Plugin {

  public static final String CHANNEL_ID = "default";

  @Override
  public void load() {
    super.load();
    createDefaultNotificationChannel();
  }

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);
    Log.d(Bridge.TAG, "Notification received: " + data.getDataString());
    JSObject dataJson = new JSObject();
    dataJson.put("extras",  data.getExtras());
    dataJson.put("id", data.getIntExtra("id",0));
    notifyListeners("localNotificationReceived", dataJson, true);
  }

  private void createDefaultNotificationChannel() {
    // Create the NotificationChannel, but only on API 26+ because
    // the NotificationChannel class is new and not in the support library
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      CharSequence name = "Default";
      String description = "Default";
      int importance = NotificationManager.IMPORTANCE_DEFAULT;
      NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
      channel.setDescription(description);
      // Register the channel with the system; you can't change the importance
      // or other notification behaviors after this
      NotificationManager notificationManager = getContext().getSystemService(NotificationManager.class);
      notificationManager.createNotificationChannel(channel);
    }
  }

  /**
   * Schedule a notification call from JavaScript
   * Creates local notification in system.
   */
  // https://github.com/katzer/cordova-plugin-local-notifications/tree/master/src/android/notification/receiver
  @PluginMethod()
  public void schedule(PluginCall call) {
    List<Notification> notifications = this.buildNotificationList(call);
    if (notifications == null) {
      return;
    }
    JSONArray ids = new JSONArray();
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.getContext());
    boolean notificationsEnabled = notificationManager.areNotificationsEnabled();
    if (!notificationsEnabled) {
      call.error("Notifications not enabled on this device");
      return;
    }
    for (Notification notification2 : notifications) {
      if (notification2.getId() == null) {
        call.error("Notification missing identifier");
        return;
      }

      Intent intent = new Intent(getContext(), getActivity().getClass());
      // intent.setAction(notification2.getActionTypeId());
      intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
      PendingIntent pendingIntent = PendingIntent.getActivity(getContext(), 0, intent, 0);

      NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this.getContext(), CHANNEL_ID)
              .setContentTitle(notification2.getTitle())
              .setContentText(notification2.getBody())
              .setPriority(NotificationCompat.PRIORITY_DEFAULT)
              .setContentIntent(pendingIntent)
              .setAutoCancel(true);



      String sound = notification2.getSound();
      if (sound != null) {
        mBuilder.setSound(Uri.parse(sound));
      }

      JSONObject extra = notification2.getExtra();
      if (extra != null) {
        Bundle extras = new Bundle();
        extras.putString("data", extra.toString());
        mBuilder.addExtras(extras);
        intent.putExtras(extras);
      }

      // notificationId is a unique int for each notification2 that you must define
      notificationManager.notify(Integer.valueOf(notification2.getId()), mBuilder.build());
      ids.put(notification2.getId());
    }
    call.success(new JSObject().put("ids", ids));
  }

  @PluginMethod()
  public void cancel(PluginCall call) {
    List<JSONObject> notifications = null;
    try {
      notifications = call.getArray("notifications").toList();
    } catch (JSONException e) {
    }
    if (notifications == null || notifications.size() == 0) {
      call.error("Must provide notifications array as notifications option");
      return;
    }
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.getContext());
    for (JSONObject notificationToCancel : notifications) {
      try {
        Integer notificationId = notificationToCancel.getInt("id");
        notificationManager.cancel(notificationId);
      } catch (JSONException e) {
        call.error("id field missing in Notification cancel method ");
        return;
      }
    }
    call.success();
  }

  @PluginMethod()
  public void getPending(PluginCall call) {
    call.error("Not implemented");
  }

  @PluginMethod()
  public void registerActionTypes(PluginCall call) {
    call.error("Not implemented");
  }


  // Parse input of the command
  private List<Notification> buildNotificationList(PluginCall call) {
    JSArray notificationArray = call.getArray("notifications");
    if (notificationArray == null) {
      call.error("Must provide notifications array as notifications option");
      return null;
    }
    List<Notification> resultNotification2s = new ArrayList<Notification>(notificationArray.length());
    List<JSONObject> notificationsJson = null;
    try {
      notificationsJson = notificationArray.toList();
    } catch (JSONException e) {
      call.error("Provided notification format is invalid");
      return null;
    }
    for (JSONObject jsonNotification : notificationsJson) {
      Notification activeNotification2 = new Notification();
      activeNotification2.setId(getString("id", jsonNotification));
      activeNotification2.setBody(getString("body", jsonNotification));
      activeNotification2.setActionTypeId(getString("actionTypeId", jsonNotification));
      activeNotification2.setSound(getString("sound", jsonNotification));
      activeNotification2.setTitle(getString("title", jsonNotification));
      // TODO Parsing for extra methods
      // activeNotification2.setSchedule();
      // activeNotification2.setAttachments();
      try {
        activeNotification2.setExtra(jsonNotification.getJSONObject("extra"));
      } catch (JSONException e) {
      }
      resultNotification2s.add(activeNotification2);
    }
    return resultNotification2s;
  }

  private String getString(String key, JSONObject jsonNotification) {
    try {
      return jsonNotification.getString(key);
    } catch (JSONException e) {
      return null;
    }
  }
}

