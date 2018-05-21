package com.getcapacitor.plugin;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

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
public class LocalNotification extends Plugin {

  public static final String CHANNEL_ID = "default";

  @Override
  public void load() {
    super.load();
    createDefaultNotificationChannel();
  }

  //
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

  // TODO unify input parameters for both IOS and Android
  /**
   * Schedule a notification.
   */
  @PluginMethod()
  public void schedule(PluginCall call) {
    List<Notification> notifications = this.buildNotificationList(call);
    if (notifications == null) {
      return;
    }
    JSONArray ids = new JSONArray();

    for (Notification notification : notifications) {
      if (notification.getId() == null) {
        call.error("Notification missing identifier");
        return;
      }

      // TODO Schedule
      // TODO ActionHandler
      // TODO Attachments
      // TODO Sound
      NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this, CHANNEL_ID)
              .setContentTitle(notification.getTitle());
              .setContentText(notification.getBody())
              .setPriority(NotificationCompat.PRIORITY_DEFAULT)
              // Set the intent that will fire when the user taps the notification
              .setAutoCancel(true);

      NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.getContext());
      // notificationId is a unique int for each notification that you must define
      notificationManager.notify(notification.getId() , mBuilder.build());
      ids.put(notification.getId());
    }
    call.success(new JSObject().put("ids", ids));
  }

  // Parse input of the command
  private List<Notification> buildNotificationList(PluginCall call) {
    JSArray notificationArray = call.getArray("notifications");
    if (notificationArray == null) {
      call.error("Must provide notifications array as notifications option");
      return null;
    }
    List<Notification> resultNotifications = new ArrayList<Notification>(notificationArray.length());
    List<JSONObject> notificationsJson = null;
    try {
      notificationsJson = notificationArray.toList();
    } catch (JSONException e) {
      call.error("Provided notification format is invalid");
      return null;
    }
    for (JSONObject jsonNotification : notificationsJson) {
      Notification activeNotification = new Notification();
      activeNotification.setId(getString("id", jsonNotification));
      activeNotification.setBody(getString("body", jsonNotification));
      activeNotification.setActionTypeId(getString("actionTypeId", jsonNotification));
      activeNotification.setSound(getString("sound", jsonNotification));
      activeNotification.setTitle(getString("title", jsonNotification));
      // TODO Parsing for extra methods
      // activeNotification.setSchedule();
      // activeNotification.setAttachments();
      try {
        activeNotification.setExtra(jsonNotification.getJSONObject("extra"));
      } catch (JSONException e) {
      }
      resultNotifications.add(activeNotification);
    }
    return resultNotifications;
  }

  private String getString(String key, JSONObject jsonNotification) {
    try {
      return jsonNotification.getString(key);
    } catch (JSONException e) {
      return null;
    }
  }
}

