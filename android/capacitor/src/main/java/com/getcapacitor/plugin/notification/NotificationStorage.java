package com.getcapacitor.plugin.notification;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.Set;

/**
 * Class used to abstract storage for notification data
 */
public class NotificationStorage {

  // Key for private preferences
  static final String NOTIFICATION_STORE_ID = "NOTIFICATION_STORE";

  private Context context;

  public NotificationStorage(Context context) {
    this.context = context;
  }

  /**
   * Persist the information of this notification.
   * This will allow the application to restore the notification
   */
  public void save(String id, NotificationRequest request) {
    SharedPreferences.Editor editor = getStorage().edit();
    editor.putString(id, request.getSource().toString());
    editor.apply();
  }


  /**
   * Remove the stored notifications
   */
  public void delete(String id) {
    SharedPreferences.Editor editor = getStorage().edit();
    editor.remove(id);
    editor.apply();
  }

  /**
   * Shared private preferences for the application.
   */
  private SharedPreferences getStorage() {
    return context.getSharedPreferences(NOTIFICATION_STORE_ID, Context.MODE_PRIVATE);
  }
}
