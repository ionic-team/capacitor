package com.getcapacitor.plugin.notification;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;



/**
 * Receiver called when notification is dismissed by user
 */
public class NotificationDismissReceiver extends BroadcastReceiver {


  @Override
  public void onReceive(Context context, Intent intent) {
    int intExtra = intent.getIntExtra(LocalNotificationManager.NOTIFICATION_INTENT_KEY, Integer.MIN_VALUE);
    if (intExtra == Integer.MIN_VALUE) {
      Log.e("LNotificationDismiss", "Invalid notification dismiss operation");
      return;
    }
    NotificationStorage notificationStorage = new NotificationStorage(context);
    notificationStorage.deleteNotification(Integer.toString(intExtra));
  }
}
