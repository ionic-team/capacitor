package com.getcapacitor.plugin.notification;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.getcapacitor.plugin.LocalNotifications;

import java.util.Date;

/**
 * Class used to create notification from timer event
 * Note: Class is being registered in Android manifest as broadcast reciever
 */
public class TimedNotificationPublisher extends BroadcastReceiver {

  public static String NOTIFICATION = "notification";
  public static String RESCHEDULE_DATA = "reschedule-data";

  /**
   * Restore and present notification
   */
  public void onReceive(Context context, Intent intent) {
    NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    Notification notification = intent.getParcelableExtra(NOTIFICATION);
    int id = intent.getIntExtra(LocalNotificationManager.NOTIFICATION_ID_INTENT_KEY, 0);
    notificationManager.notify(id, notification);

    rescheduleNotificationIfNeeded(context, intent, id);
  }

  private void rescheduleNotificationIfNeeded(Context context, Intent intent, int id) {
    DateMatch date = intent.getParcelableExtra(RESCHEDULE_DATA);
    if (date != null) {
      AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
      long trigger = date.nextTrigger(new Date());
      Intent clone = (Intent) intent.clone();
      PendingIntent pendingIntent = PendingIntent.getBroadcast(context, id, clone, PendingIntent.FLAG_CANCEL_CURRENT);
      alarmManager.set(AlarmManager.RTC, trigger, pendingIntent);
    }
  }

}