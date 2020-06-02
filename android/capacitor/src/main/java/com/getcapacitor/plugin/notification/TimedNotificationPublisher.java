package com.getcapacitor.plugin.notification;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.getcapacitor.Logger;

import java.util.Date;

/**
 * Class used to create notification from timer event
 * Note: Class is being registered in Android manifest as broadcast receiver
 */
public class TimedNotificationPublisher extends BroadcastReceiver {

  public static String NOTIFICATION_KEY = "NotificationPublisher.notification";
  public static String CRON_KEY = "NotificationPublisher.cron";

  /**
   * Restore and present notification
   */
  public void onReceive(Context context, Intent intent) {
    NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    Notification notification = intent.getParcelableExtra(NOTIFICATION_KEY);
    int id = intent.getIntExtra(LocalNotificationManager.NOTIFICATION_INTENT_KEY, Integer.MIN_VALUE);
    if (id == Integer.MIN_VALUE) {
      Logger.error(Logger.tags("LN"), "No valid id supplied", null);
    }
    notificationManager.notify(id, notification);
    rescheduleNotificationIfNeeded(context, intent, id);
  }

  private void rescheduleNotificationIfNeeded(Context context, Intent intent, int id) {
    String dateString = intent.getStringExtra(CRON_KEY);
    if (dateString != null) {
      DateMatch date = DateMatch.fromMatchString(dateString);
      AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
      long trigger = date.nextTrigger(new Date());
      Intent clone = (Intent) intent.clone();
      PendingIntent pendingIntent = PendingIntent.getBroadcast(context, id, clone, PendingIntent.FLAG_CANCEL_CURRENT);
      alarmManager.set(AlarmManager.RTC, trigger, pendingIntent);
    }
  }

}