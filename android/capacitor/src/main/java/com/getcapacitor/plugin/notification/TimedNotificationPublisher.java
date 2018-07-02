package com.getcapacitor.plugin.notification;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.getcapacitor.plugin.LocalNotifications;

/**
 * Class used to create notification from timer event
 */
public class TimedNotificationPublisher extends BroadcastReceiver {

    public static String NOTIFICATION = "notification";

    /**
     * Restore and present notification
     */
    public void onReceive(Context context, Intent intent) {
        NotificationManager notificationManager = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
        Notification notification = intent.getParcelableExtra(NOTIFICATION);
        int id = intent.getIntExtra(LocalNotifications.NOTIFICATION_ID, 0);
        notificationManager.notify(id, notification);
    }
}