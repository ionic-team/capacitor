package com.getcapacitor.plugin.notification;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.getcapacitor.Logger;


/**
 * Receiver called when notification is dismissed by user
 */
public class NotificationDismissReceiver extends BroadcastReceiver {


  @Override
  public void onReceive(Context context, Intent intent) {
    int intExtra = intent.getIntExtra(LocalNotificationManager.NOTIFICATION_INTENT_KEY, Integer.MIN_VALUE);
    if (intExtra == Integer.MIN_VALUE) {
      Logger.error(Logger.tags("LN"), "Invalid notification dismiss operation", null);
      return;
    }
    boolean isRemovable = intent.getBooleanExtra(LocalNotificationManager.NOTIFICATION_IS_REMOVABLE_KEY, true);
    if (isRemovable) {
      NotificationStorage notificationStorage = new NotificationStorage(context);
      notificationStorage.deleteNotification(Integer.toString(intExtra));
    }

  }
}
