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
import android.support.v4.app.RemoteInput;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.PluginCall;
import com.getcapacitor.plugin.LocalNotifications;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Date;
import java.util.List;

/**
 * Contains implementations for all notification actions
 */
public class LocalNotificationManager {

  // Action constants
  public static final String NOTIFICATION_ID_INTENT_KEY = "notificationId";
  public static final String ACTION_INTENT_KEY = "NotificationUserAction";
  public static final String REMOTE_INPUT_KEY = "NotificationInput";


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

  // TODO Progressbar support
  // TODO System categories (DO_NOT_DISTURB etc.)
  // TODO control visibility Notification.VISIBILITY_PRIVATE
  // TODO Group notifications (setGroup, setGroupSummary, setNumber)
  // TODO use NotificationCompat.MessagingStyle for latest API
  // TODO expandable notification NotificationCompat.MessagingStyle
  // TODO media style notification support NotificationCompat.MediaStyle
  // TODO custom small/large icons
  private void buildNotification(NotificationManagerCompat notificationManager, LocalNotification localNotification, PluginCall call) {
    NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this.context, DEFAULT_NOTIFICATION_CHANNEL_ID)
            .setContentTitle(localNotification.getTitle())
            .setContentText(localNotification.getBody())
            .setAutoCancel(true)
            .setOngoing(false)
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

    mBuilder.setVisibility(Notification.VISIBILITY_PRIVATE);
    mBuilder.setOnlyAlertOnce(true);

    mBuilder.setSmallIcon(localNotification.getSmallIcon(context));
    createActionIntents(localNotification, mBuilder);
    // notificationId is a unique int for each localNotification that you must define
    Notification buildNotification = mBuilder.build();
    if (localNotification.isScheduled()) {
      triggerScheduledNotification(buildNotification, localNotification);
    } else {
      notificationManager.notify(localNotification.getId(), buildNotification);
    }
  }

  // Create intents for open/dissmis actions
  private void createActionIntents(LocalNotification localNotification, NotificationCompat.Builder mBuilder) {
    // Open intent
    Intent intent = new Intent(context, activity.getClass());
    intent.setAction(LocalNotifications.OPEN_NOTIFICATION_ACTION);
    PendingIntent pendingIntent = PendingIntent.getActivity(context, localNotification.getId(), intent, 0);
    mBuilder.setContentIntent(pendingIntent);

    String actionTypeId = localNotification.getActionTypeId();
    if (actionTypeId != null) {
      NotificationAction[] actionGroup = storage.getActionGroup(actionTypeId);
      for (int i = 0; i < actionGroup.length; i++) {
        NotificationAction notificationAction = actionGroup[i];
        // TODO Add custom icons to actions
        // TODO build separate pending intents for actions
        NotificationCompat.Action.Builder actionBuilder = new NotificationCompat.Action.Builder(0, notificationAction.getTitle(), pendingIntent);
        intent.putExtra(ACTION_INTENT_KEY, notificationAction.getId());
        if (notificationAction.isInput()) {
          RemoteInput remoteInput = new RemoteInput.Builder(REMOTE_INPUT_KEY)
                  .setLabel(notificationAction.getTitle())
                  .build();
          actionBuilder.addRemoteInput(remoteInput);
        }
        mBuilder.addAction(actionBuilder.build());
      }
    }

    JSONObject extra = localNotification.getExtra();
    if (extra != null) {
      Bundle extras = new Bundle();
      extras.putString("data", extra.toString());
      extras.putInt(NOTIFICATION_ID_INTENT_KEY, localNotification.getId());
      mBuilder.addExtras(extras);
      intent.putExtras(extras);
    }

    // Dismiss intent
    Intent dissmissIntent = new Intent(context, activity.getClass());

    PendingIntent deleteIntent = PendingIntent.getBroadcast(
            context, localNotification.getId(), dissmissIntent, 0);
    mBuilder.setDeleteIntent(deleteIntent);
  }

  /**
   * Build a notification trigger, such as triggering each N seconds, or
   * on a certain date "shape" (such as every first of the month)
   */
  private void triggerScheduledNotification(Notification notification, LocalNotification request) {
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    LocalNotificationSchedule schedule = request.getSchedule();
    Intent notificationIntent = new Intent(context, TimedNotificationPublisher.class);
    notificationIntent.putExtra(NOTIFICATION_ID_INTENT_KEY, request.getId());
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
    List<Integer> notificationsToCancel = LocalNotification.getLocalNotificationPendingList(call);
    if (notificationsToCancel != null) {
      for (Integer id : notificationsToCancel) {
        dismissVisibleNotification(call, id);
        cancelTimerForNotification(id);
        storage.deleteNotification(Integer.toString(id));
      }
    }
    call.success();
  }

  private void cancelTimerForNotification(Integer notificationId) {
    Intent intent = new Intent(context, TimedNotificationPublisher.class);
    PendingIntent pi = PendingIntent.getBroadcast(
            context, notificationId, intent, 0);
    if (pi != null) {
      AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
      alarmManager.cancel(pi);
    }
  }

  private void dismissVisibleNotification(PluginCall call, int notificationId) {
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.context);
    notificationManager.cancel(notificationId);
  }
}
