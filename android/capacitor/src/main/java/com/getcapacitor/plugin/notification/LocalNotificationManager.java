package com.getcapacitor.plugin.notification;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.RemoteInput;

import com.getcapacitor.Config;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.PluginCall;
import com.getcapacitor.android.R;
import com.getcapacitor.plugin.util.AssetUtil;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;
import java.util.List;


/**
 * Contains implementations for all notification actions
 */
public class LocalNotificationManager {

  private static final String CONFIG_KEY_PREFIX = "plugins.LocalNotifications.";
  private static int defaultSoundID = AssetUtil.RESOURCE_ID_ZERO_VALUE;
  private static int defaultSmallIconID = AssetUtil.RESOURCE_ID_ZERO_VALUE;
  // Action constants
  public static final String NOTIFICATION_INTENT_KEY = "LocalNotificationId";
  public static final String NOTIFICATION_OBJ_INTENT_KEY = "LocalNotficationObject";
  public static final String ACTION_INTENT_KEY = "LocalNotificationUserAction";
  public static final String NOTIFICATION_IS_REMOVABLE_KEY = "LocalNotificationRepeating";
  public static final String REMOTE_INPUT_KEY = "LocalNotificationRemoteInput";

  public static final String DEFAULT_NOTIFICATION_CHANNEL_ID = "default";
  private static final String DEFAULT_PRESS_ACTION = "tap";

  private Context context;
  private Activity activity;
  private NotificationStorage storage;
  private Config config;

  public LocalNotificationManager(NotificationStorage notificationStorage, Activity activity, Context context, Config config) {
    storage = notificationStorage;
    this.activity = activity;
    this.context = context;
    this.config = config;
  }

  /**
   * Method extecuted when notification is launched by user from the notification bar.
   */
  public JSObject handleNotificationActionPerformed(Intent data, NotificationStorage notificationStorage) {
    Logger.debug(Logger.tags("LN"), "LocalNotification received: " + data.getDataString());
    int notificationId = data.getIntExtra(LocalNotificationManager.NOTIFICATION_INTENT_KEY, Integer.MIN_VALUE);
    if (notificationId == Integer.MIN_VALUE) {
      Logger.debug(Logger.tags("LN"), "Activity started without notification attached");
      return null;
    }
    boolean isRemovable = data.getBooleanExtra(LocalNotificationManager.NOTIFICATION_IS_REMOVABLE_KEY, true);
    if (isRemovable) {
      notificationStorage.deleteNotification(Integer.toString(notificationId));
    }
    JSObject dataJson = new JSObject();

    Bundle results = RemoteInput.getResultsFromIntent(data);
    if (results != null) {
      CharSequence input = results.getCharSequence(LocalNotificationManager.REMOTE_INPUT_KEY);
      dataJson.put("inputValue", input.toString());
    }
    String menuAction = data.getStringExtra(LocalNotificationManager.ACTION_INTENT_KEY);
    if (menuAction != DEFAULT_PRESS_ACTION) {
      dismissVisibleNotification(notificationId);
    }
    dataJson.put("actionId", menuAction);
    JSONObject request = null;
    try {
      String notificationJsonString = data.getStringExtra(LocalNotificationManager.NOTIFICATION_OBJ_INTENT_KEY);
      if (notificationJsonString != null) {
        request = new JSObject(notificationJsonString);
      }
    } catch (JSONException e) {
    }
    dataJson.put("notification", request);
    return dataJson;
  }

  /**
   * Create notification channel
   */
  public void createNotificationChannel() {
    // Create the NotificationChannel, but only on API 26+ because
    // the NotificationChannel class is new and not in the support library
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      CharSequence name = "Default";
      String description = "Default";
      int importance = android.app.NotificationManager.IMPORTANCE_DEFAULT;
      NotificationChannel channel = new NotificationChannel(DEFAULT_NOTIFICATION_CHANNEL_ID, name, importance);
      channel.setDescription(description);
      AudioAttributes audioAttributes = new AudioAttributes.Builder()
              .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
              .setUsage(AudioAttributes.USAGE_ALARM).build();
      Uri soundUri = this.getDefaultSoundUrl(context);
      if (soundUri != null) {
        channel.setSound(soundUri, audioAttributes);
      }
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
      Integer id = localNotification.getId();
      if (localNotification.getId() == null) {
        call.error("LocalNotification missing identifier");
        return null;
      }
      dismissVisibleNotification(id);
      cancelTimerForNotification(id);
      buildNotification(notificationManager, localNotification, call);
      ids.put(id);
    }
    return ids;
  }

  // TODO Progressbar support
  // TODO System categories (DO_NOT_DISTURB etc.)
  // TODO control visibility by flag Notification.VISIBILITY_PRIVATE
  // TODO Group notifications (setGroup, setGroupSummary, setNumber)
  // TODO use NotificationCompat.MessagingStyle for latest API
  // TODO expandable notification NotificationCompat.MessagingStyle
  // TODO media style notification support NotificationCompat.MediaStyle
  // TODO custom small/large icons
  private void buildNotification(NotificationManagerCompat notificationManager, LocalNotification localNotification, PluginCall call) {
    String channelId = DEFAULT_NOTIFICATION_CHANNEL_ID;
    if (localNotification.getChannelId() != null) {
      channelId = localNotification.getChannelId();
    }
    NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this.context, channelId)
            .setContentTitle(localNotification.getTitle())
            .setContentText(localNotification.getBody())
            .setAutoCancel(true)
            .setOngoing(false)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setGroupSummary(localNotification.isGroupSummary());


    // support multiline text
    mBuilder.setStyle(new NotificationCompat.BigTextStyle().bigText(localNotification.getBody()));

    String sound = localNotification.getSound(context, getDefaultSound(context));
    if (sound != null) {
      Uri soundUri = Uri.parse(sound);
      // Grant permission to use sound
      context.grantUriPermission(
              "com.android.systemui", soundUri,
              Intent.FLAG_GRANT_READ_URI_PERMISSION);
      mBuilder.setSound(soundUri);
      mBuilder.setDefaults(Notification.DEFAULT_VIBRATE | Notification.DEFAULT_LIGHTS);
    } else {
      mBuilder.setDefaults(Notification.DEFAULT_ALL);
    }


    String group = localNotification.getGroup();
    if (group != null) {
      mBuilder.setGroup(group);
    }

    // make sure scheduled time is shown instead of display time
    if (localNotification.isScheduled() && localNotification.getSchedule().getAt() != null) {
      mBuilder.setWhen(localNotification.getSchedule().getAt().getTime())
              .setShowWhen(true);
    }

    mBuilder.setVisibility(NotificationCompat.VISIBILITY_PRIVATE);
    mBuilder.setOnlyAlertOnce(true);

    mBuilder.setSmallIcon(localNotification.getSmallIcon(context, getDefaultSmallIcon(context)));

    String iconColor = localNotification.getIconColor(config.getString(CONFIG_KEY_PREFIX + "iconColor"));
    if (iconColor != null) {
      try {
        mBuilder.setColor(Color.parseColor(iconColor));
      } catch (IllegalArgumentException ex) {
        call.error("Invalid color provided. Must be a hex string (ex: #ff0000");
        return;
      }
    }

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
    Intent intent = buildIntent(localNotification, DEFAULT_PRESS_ACTION);

    PendingIntent pendingIntent = PendingIntent.getActivity(context, localNotification.getId(), intent, PendingIntent.FLAG_CANCEL_CURRENT);
    mBuilder.setContentIntent(pendingIntent);

    // Build action types
    String actionTypeId = localNotification.getActionTypeId();
    if (actionTypeId != null) {
      NotificationAction[] actionGroup = storage.getActionGroup(actionTypeId);
      for (int i = 0; i < actionGroup.length; i++) {
        NotificationAction notificationAction = actionGroup[i];
        // TODO Add custom icons to actions
        Intent actionIntent = buildIntent(localNotification, notificationAction.getId());
        PendingIntent actionPendingIntent = PendingIntent.getActivity(context, localNotification.getId() + notificationAction.getId().hashCode(), actionIntent, PendingIntent.FLAG_CANCEL_CURRENT);
        NotificationCompat.Action.Builder actionBuilder = new NotificationCompat.Action.Builder(R.drawable.ic_transparent, notificationAction.getTitle(), actionPendingIntent);
        if (notificationAction.isInput()) {
          RemoteInput remoteInput = new RemoteInput.Builder(REMOTE_INPUT_KEY)
                  .setLabel(notificationAction.getTitle())
                  .build();
          actionBuilder.addRemoteInput(remoteInput);
        }
        mBuilder.addAction(actionBuilder.build());
      }
    }

    // Dismiss intent
    Intent dissmissIntent = new Intent(context, NotificationDismissReceiver.class);
    dissmissIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
    dissmissIntent.putExtra(NOTIFICATION_INTENT_KEY, localNotification.getId());
    dissmissIntent.putExtra(ACTION_INTENT_KEY, "dismiss");
    LocalNotificationSchedule schedule = localNotification.getSchedule();
    dissmissIntent.putExtra(NOTIFICATION_IS_REMOVABLE_KEY, schedule == null || schedule.isRemovable());
    PendingIntent deleteIntent = PendingIntent.getBroadcast(
            context, localNotification.getId(), dissmissIntent, 0);
    mBuilder.setDeleteIntent(deleteIntent);
  }

  @NonNull
  private Intent buildIntent(LocalNotification localNotification, String action) {
    Intent intent;
    if (activity != null) {
      intent = new Intent(context, activity.getClass());
    } else {
      String packageName = context.getPackageName();
      intent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    }
    intent.setAction(Intent.ACTION_MAIN);
    intent.addCategory(Intent.CATEGORY_LAUNCHER);
    intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    intent.putExtra(NOTIFICATION_INTENT_KEY, localNotification.getId());
    intent.putExtra(ACTION_INTENT_KEY, action);
    intent.putExtra(NOTIFICATION_OBJ_INTENT_KEY, localNotification.getSource());
    LocalNotificationSchedule schedule = localNotification.getSchedule();
    intent.putExtra(NOTIFICATION_IS_REMOVABLE_KEY, schedule == null || schedule.isRemovable());
    return intent;
  }

  /**
   * Build a notification trigger, such as triggering each N seconds, or
   * on a certain date "shape" (such as every first of the month)
   */
  // TODO support different AlarmManager.RTC modes depending on priority
  // TODO restore alarm on device shutdown (requires persistence)
  private void triggerScheduledNotification(Notification notification, LocalNotification request) {
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    LocalNotificationSchedule schedule = request.getSchedule();
    Intent notificationIntent = new Intent(context, TimedNotificationPublisher.class);
    notificationIntent.putExtra(NOTIFICATION_INTENT_KEY, request.getId());
    notificationIntent.putExtra(TimedNotificationPublisher.NOTIFICATION_KEY, notification);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, request.getId(), notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);

    // Schedule at specific time (with repeating support)
    Date at = schedule.getAt();
    if (at != null) {
      if (at.getTime() < new Date().getTime()) {
        Logger.error(Logger.tags("LN"), "Scheduled time must be *after* current time", null);
        return;
      }
      if (schedule.isRepeating()) {
        long interval = at.getTime() - new Date().getTime();
        alarmManager.setRepeating(AlarmManager.RTC, at.getTime(), interval, pendingIntent);
      } else {
        alarmManager.setExact(AlarmManager.RTC, at.getTime(), pendingIntent);
      }
      return;
    }

    // Schedule at specific intervals
    String every = schedule.getEvery();
    if (every != null) {
      Long everyInterval = schedule.getEveryInterval();
      if (everyInterval != null) {
        long startTime = new Date().getTime() + everyInterval;
        alarmManager.setRepeating(AlarmManager.RTC, startTime, everyInterval, pendingIntent);
      }
      return;
    }

    // Cron like scheduler
    DateMatch on = schedule.getOn();
    if (on != null) {
      notificationIntent.putExtra(TimedNotificationPublisher.CRON_KEY, on.toMatchString());
      pendingIntent = PendingIntent.getBroadcast(context, request.getId(), notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
      alarmManager.setExact(AlarmManager.RTC, on.nextTrigger(new Date()), pendingIntent);
    }
  }

  public void cancel(PluginCall call) {
    List<Integer> notificationsToCancel = LocalNotification.getLocalNotificationPendingList(call);
    if (notificationsToCancel != null) {
      for (Integer id : notificationsToCancel) {
        dismissVisibleNotification(id);
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

  private void dismissVisibleNotification(int notificationId) {
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.context);
    notificationManager.cancel(notificationId);
  }

  public boolean areNotificationsEnabled(){
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
    return notificationManager.areNotificationsEnabled();
  }

  public Uri getDefaultSoundUrl(Context context){
    int soundId = this.getDefaultSound(context);
    if (soundId != AssetUtil.RESOURCE_ID_ZERO_VALUE) {
      return Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + context.getPackageName() + "/" + soundId);
    }
    return null;
  }

  private int getDefaultSound(Context context){
    if(defaultSoundID != AssetUtil.RESOURCE_ID_ZERO_VALUE) return defaultSoundID;

    int resId = AssetUtil.RESOURCE_ID_ZERO_VALUE;
    String soundConfigResourceName = config.getString(CONFIG_KEY_PREFIX + "sound");
    soundConfigResourceName = AssetUtil.getResourceBaseName(soundConfigResourceName);

    if(soundConfigResourceName != null){
      resId = AssetUtil.getResourceID(context, soundConfigResourceName, "raw");
    }

    defaultSoundID = resId;
    return resId;
  }

  private int getDefaultSmallIcon(Context context){
    if(defaultSmallIconID != AssetUtil.RESOURCE_ID_ZERO_VALUE) return defaultSmallIconID;

    int resId = AssetUtil.RESOURCE_ID_ZERO_VALUE;
    String smallIconConfigResourceName = config.getString(CONFIG_KEY_PREFIX + "smallIcon");
    smallIconConfigResourceName = AssetUtil.getResourceBaseName(smallIconConfigResourceName);

    if(smallIconConfigResourceName != null){
      resId = AssetUtil.getResourceID(context, smallIconConfigResourceName, "drawable");
    }

    if(resId == AssetUtil.RESOURCE_ID_ZERO_VALUE){
      resId = android.R.drawable.ic_dialog_info;
    }

    defaultSmallIconID = resId;
    return resId;
  }
}
