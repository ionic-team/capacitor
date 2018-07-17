package com.getcapacitor.plugin.notification;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.PluginCall;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;
import java.util.List;

/**
 * Contains implementations for all notification actions
 */
public class LocalNotificationManager {

  // Action constants
  public static final String NOTIFICATION_ID = "notificationId";
  public static final String ACTION_PREFIX = "Notification";

  public static final String DEFAULT_NOTIFICATION_CHANNEL_ID = "default";

  private Context context;
  private Activity activity;
  private NotificationStorage storage;

  public LocalNotificationManager(NotificationStorage notificationStorage, Activity activity) {
    storage = notificationStorage;
    this.activity = activity;
    this.context = activity;
  }

  /**
   * Create notification channel
   */
  public void createNotificationChannel() {
    // TODO allow to create multiple channels
    // Create the NotificationChannel, but only on API 26+ because
    // the NotificationChannel class is new and not in the support library
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      CharSequence name = "Default";
      String description = "Default";
      int importance = android.app.NotificationManager.IMPORTANCE_DEFAULT;
      NotificationChannel channel = new NotificationChannel(DEFAULT_NOTIFICATION_CHANNEL_ID, name, importance);
      channel.setDescription(description);
      // Register the channel with the system; you can't change the importance
      // or other notification behaviors after this
      android.app.NotificationManager notificationManager = context.getSystemService(android.app.NotificationManager.class);
      notificationManager.createNotificationChannel(channel);
    }
  }

  @Nullable
  public JSONArray schedule(PluginCall call, List<LocalNotification> localNotifications) {
    JSONArray ids = new JSONArray();
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);

    boolean notificationsEnabled = notificationManager.areNotificationsEnabled();
    if (!notificationsEnabled) {
      call.error("Notifications not enabled on this device");
      return null;
    }
    for (LocalNotification localNotification : localNotifications) {
      if (localNotification.getId() == null) {
        call.error("LocalNotification missing identifier");
        return null;
      }
      buildNotification(notificationManager, localNotification, call);
      ids.put(localNotification.getId());
    }
    return ids;
  }

  private void buildNotification(NotificationManagerCompat notificationManager, LocalNotification localNotification, PluginCall call) {
    NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this.context, DEFAULT_NOTIFICATION_CHANNEL_ID)
            .setContentTitle(localNotification.getTitle())
            .setContentText(localNotification.getBody())
            .setOnlyAlertOnce(false)
            .setAutoCancel(true)
            .setOngoing(false)
            .setVisibility(Notification.VISIBILITY_PRIVATE)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setDefaults(Notification.DEFAULT_SOUND | Notification.DEFAULT_VIBRATE | Notification.DEFAULT_LIGHTS);


    String sound = localNotification.getSound();
    if (sound != null) {
      Uri soundUri = Uri.parse(sound);
      // Grant permission to use sound
      context.grantUriPermission(
              "com.android.systemui", soundUri,
              Intent.FLAG_GRANT_READ_URI_PERMISSION);
      mBuilder.setSound(soundUri);

    }
    // TODO Group notifications from js side
    // mBuilder.setGroup("test");
    // mBuilder.setGroupSummary("Grouped notifications");
    // mBuilder.setNumber(1);

    // TODO custom small/large icons
    mBuilder.setSmallIcon(localNotification.getSmallIcon(context));
    createActionIntents(localNotification, mBuilder);
    // notificationId is a unique int for each localNotification that you must define
    Notification buildNotification = mBuilder.build();
    if (localNotification.isScheduled()) {
      handleScheduledNotification(buildNotification, localNotification);
    } else {
      notificationManager.notify(localNotification.getId(), buildNotification);
    }

  }

  // Create intents for open/dissmis actions
  private void createActionIntents(LocalNotification localNotification, NotificationCompat.Builder mBuilder) {
    String actionTypeId = localNotification.getActionTypeId();
    if (actionTypeId != null) {
      NotificationAction[] actionGroup = storage.getActionGroup(actionTypeId);
      // TODO build actiongroup
    }
    // Open intent
    int reqCode = ((int) Math.random());
    Intent intent = new Intent(context, activity.getClass());
    //intent.setAction(ACTION_PREFIX + localNotification.getId());
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
    PendingIntent pendingIntent = PendingIntent.getActivity(context, reqCode, intent, 0);
    mBuilder.setContentIntent(pendingIntent);

    JSONObject extra = localNotification.getExtra();
    if (extra != null) {
      Bundle extras = new Bundle();
      extras.putString("data", extra.toString());
      extras.putInt(NOTIFICATION_ID, localNotification.getId());
      mBuilder.addExtras(extras);
      intent.putExtras(extras);
    }

    // Dismiss intent
    Intent dissmissIntent = new Intent(context, activity.getClass())
            .setAction(localNotification.getId().toString());

    PendingIntent deleteIntent = PendingIntent.getBroadcast(
            context, reqCode, dissmissIntent, 0);
    mBuilder.setDeleteIntent(deleteIntent);
  }


  /**
   * Build a notification trigger, such as triggering each N seconds, or
   * on a certain date "shape" (such as every first of the month)
   */
  private void handleScheduledNotification(Notification notification, LocalNotification request) {
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    LocalNotificationSchedule schedule = request.getSchedule();
    Intent notificationIntent = new Intent(context, TimedNotificationPublisher.class);
    notificationIntent.putExtra(NOTIFICATION_ID, request.getId());
    notificationIntent.putExtra(TimedNotificationPublisher.NOTIFICATION, notification);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, request.getId(), notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
    // TODO support different modes depending on priority
    // TODO restore alarm on device shutdown (requires persistence)
    // Schedule at specific time (with repeating support)
    Date at = schedule.getAt();
    if (at != null) {
      if (at.getTime() < new Date().getTime()) {
        Log.e(Bridge.TAG, "Scheduled time must be *after* current time");
        return;
      }
      if (schedule.isRepeating()) {
        long interval = at.getTime() - new Date().getTime();
        alarmManager.setRepeating(AlarmManager.RTC, at.getTime(), interval, pendingIntent);
      } else {
        alarmManager.set(AlarmManager.RTC, at.getTime(), pendingIntent);
      }
    }

    // Schedule at specific intervals
    String every = schedule.getEvery();
    if (every != null) {
      Long everyInterval = schedule.getEveryInterval();
      if (everyInterval != null) {
        long startTime = new Date().getTime() + everyInterval;
        alarmManager.setRepeating(AlarmManager.RTC, startTime, everyInterval, pendingIntent);
      }
    }

    // Cron like scheduler
    DateMatch on = schedule.getOn();
    if (on != null) {
      notificationIntent.putExtra(TimedNotificationPublisher.RESCHEDULE_DATA, on);
      alarmManager.set(AlarmManager.RTC, on.nextTrigger(new Date()), pendingIntent);
    }
  }

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

    for (JSONObject notificationToCancel : notifications) {
      dismissCurrentNotification(call, notificationToCancel);
    }
    call.success();
  }

  private void cancelTimerNotification(Integer notificationId) {
    Intent intent = new Intent(context, TimedNotificationPublisher.class);
    intent.setAction(ACTION_PREFIX + notificationId);
    PendingIntent pi = PendingIntent.getBroadcast(
            context, 0, intent, 0);
    if (pi != null) {
      AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
      alarmManager.cancel(pi);
    }
  }

  private void dismissCurrentNotification(PluginCall call, JSONObject notificationToCancel) {
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.context);
    try {
      Integer notificationId = notificationToCancel.getInt("id");
      storage.deleteNotification(Integer.toString(notificationId));
      cancelTimerNotification(notificationId);
      notificationManager.cancel(notificationId);
    } catch (JSONException e) {
      call.error("id field missing in LocalNotification cancel method ");
    }
  }

}
