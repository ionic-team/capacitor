package com.getcapacitor.plugin.notification;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.UserManager;

import com.getcapacitor.CapConfig;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static android.os.Build.VERSION.SDK_INT;

public class LocalNotificationRestoreReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (SDK_INT >= 24) {
            UserManager um = context.getSystemService(UserManager.class);
            if (um == null || !um.isUserUnlocked()) return;
        }

        NotificationStorage storage = new NotificationStorage(context);
        List<String> ids = storage.getSavedNotificationIds();

        ArrayList<LocalNotification> notifications = new ArrayList<>(ids.size());
        ArrayList<LocalNotification> updatedNotifications = new ArrayList<>();
        for (String id : ids) {
            LocalNotification notification = storage.getSavedNotification(id);
            if(notification == null) {
                continue;
            }

            LocalNotificationSchedule schedule = notification.getSchedule();
            if(schedule != null) {
                Date at = schedule.getAt();
                if(at != null && at.before(new Date())) {
                    // modify the scheduled date in order to show notifications that would have been delivered while device was off.
                    long newDateTime = new Date().getTime() + 15 * 1000;
                    schedule.setAt(new Date(newDateTime));
                    notification.setSchedule(schedule);
                    updatedNotifications.add(notification);
                }
            }

            notifications.add(notification);
        }

        if(updatedNotifications.size() > 0){
            storage.appendNotifications(updatedNotifications);
        }

        CapConfig config = new CapConfig(context.getAssets(), null);
        LocalNotificationManager localNotificationManager = new LocalNotificationManager(storage, null, context, config);

        localNotificationManager.schedule(null, notifications);
    }
}
