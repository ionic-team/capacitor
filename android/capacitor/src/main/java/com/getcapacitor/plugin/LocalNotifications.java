package com.getcapacitor.plugin;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.plugin.notification.LocalNotificationSchedule;
import com.getcapacitor.plugin.notification.NotificationRequest;
import com.getcapacitor.plugin.notification.TimedNotificationPublisher;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;
import java.util.List;


/**
 * Plugin for creating local notification
 */
@NativePlugin()
public class LocalNotifications extends Plugin {

  public static final String CHANNEL_ID = "default";

  // Action constants
  public static final String NOTIFICATION_ID = "notificationId";
  public static final String ACTION_TYPE_ID = "actionTypeId";

  @Override
  public void load() {
    super.load();
    createDefaultNotificationChannel();
  }

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);
    Log.d(Bridge.TAG, "NotificationRequest received: " + data.getDataString());
    JSObject dataJson = new JSObject();
    dataJson.put("extras", data.getExtras());
    dataJson.put("id", data.getIntExtra(NOTIFICATION_ID, 0));
    dataJson.put(ACTION_TYPE_ID, data.getIntExtra(ACTION_TYPE_ID, 0));
    notifyListeners("localNotificationReceived", dataJson, true);
  }

  private void createDefaultNotificationChannel() {
    // TODO allow to create multiple channels
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
  @PluginMethod()
  public void schedule(PluginCall call) {
    List<NotificationRequest> notificationRequests = NotificationRequest.buildNotificationList(call);
    if (notificationRequests == null) {
      return;
    }
    JSONArray ids = new JSONArray();
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.getContext());

    boolean notificationsEnabled = notificationManager.areNotificationsEnabled();
    if (!notificationsEnabled) {
      call.error("Notifications not enabled on this device");
      return;
    }
    for (NotificationRequest notificationRequest : notificationRequests) {
      if (notificationRequest.getId() == null) {
        call.error("NotificationRequest missing identifier");
        return;
      }

      buildNotification(notificationManager, notificationRequest, call);
      ids.put(notificationRequest.getId());
    }
    call.success(new JSObject().put("ids", ids));
  }

  private void buildNotification(NotificationManagerCompat notificationManager, NotificationRequest notificationRequest, PluginCall call) {
    NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this.getContext(), CHANNEL_ID)
            .setContentTitle(notificationRequest.getTitle())
            .setContentText(notificationRequest.getBody())
            .setOnlyAlertOnce(false)
            .setAutoCancel(true)
            .setOngoing(false)
            .setVisibility(Notification.VISIBILITY_PRIVATE)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setDefaults(Notification.DEFAULT_SOUND | Notification.DEFAULT_VIBRATE | Notification.DEFAULT_LIGHTS);


    String sound = notificationRequest.getSound();
    if (sound != null) {
      mBuilder.setSound(Uri.parse(sound));
    }

    // TODO Group notifications from js side
    // mBuilder.setGroup("test");
    // mBuilder.setGroupSummary("Grouped notifications");
    // mBuilder.setNumber(1);

    // TODO custom small/large icons
    mBuilder.setSmallIcon(notificationRequest.getSmallIcon(getContext()));
    createActionIntents(notificationRequest, mBuilder);
    // notificationId is a unique int for each notificationRequest that you must define
    Notification buildNotification = mBuilder.build();
    if (notificationRequest.isScheduled()) {
      handleScheduledNotification(buildNotification, notificationRequest);
    } else {
      notificationManager.notify(notificationRequest.getId(), buildNotification);
    }

  }

  // Create intents for open/dissmis actions
  private void createActionIntents(NotificationRequest notificationRequest, NotificationCompat.Builder mBuilder) {
    // Open intent
    int reqCode = ((int) Math.random());
    Intent intent = new Intent(getContext(), getActivity().getClass());
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
    PendingIntent pendingIntent = PendingIntent.getActivity(getContext(), reqCode, intent, 0);
    mBuilder.setContentIntent(pendingIntent);

    JSONObject extra = notificationRequest.getExtra();
    if (extra != null) {
      Bundle extras = new Bundle();
      extras.putString("data", extra.toString());
      extras.putInt(NOTIFICATION_ID, notificationRequest.getId());
      extras.putString(ACTION_TYPE_ID, notificationRequest.getActionTypeId());
      mBuilder.addExtras(extras);
      intent.putExtras(extras);
    }

    // Dismiss intent
    Intent dissmissIntent = new Intent(getContext(), getActivity().getClass())
            .setAction(notificationRequest.getId().toString());

    PendingIntent deleteIntent = PendingIntent.getBroadcast(
            getContext(), reqCode, dissmissIntent, 0);
    mBuilder.setDeleteIntent(deleteIntent);
  }


  /**
   * Build a notification trigger, such as triggering each N seconds, or
   * on a certain date "shape" (such as every first of the month)
   */
  private void handleScheduledNotification(Notification notification, NotificationRequest request) {
    AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
    LocalNotificationSchedule schedule = request.getSchedule();
    Intent notificationIntent = new Intent(getContext(), TimedNotificationPublisher.class);
    notificationIntent.putExtra(NOTIFICATION_ID, request.getId());
    notificationIntent.putExtra(TimedNotificationPublisher.NOTIFICATION, notification);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(getContext(), request.getId(), notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
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
    Long everyInterval = schedule.getEveryInterval();
    if (everyInterval != null) {
      long startTime = new Date().getTime() + everyInterval;
      alarmManager.setRepeating(AlarmManager.RTC, startTime, everyInterval, pendingIntent);
    }

    // Cron like scheduler
    Long on = schedule.getNextOnSchedule();
    if (on != null) {
      notificationIntent.putExtra(TimedNotificationPublisher.RESCHEDULE_TIME, schedule.getOn());
      alarmManager.set(AlarmManager.RTC, on, pendingIntent);
    }

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
        call.error("id field missing in NotificationRequest cancel method ");
        return;
      }
    }
    call.success();
  }

  @PluginMethod()
  public void getPending(PluginCall call) {
    // TODO save pending notifications to store
    call.error("Not implemented");
  }

  @PluginMethod()
  public void registerActionTypes(PluginCall call) {
    // TODO
    call.error("Not implemented");
  }

}

