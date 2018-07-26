package com.getcapacitor.plugin.notification;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Class used to abstract storage for notification data
 */
public class NotificationStorage {

  // Key for private preferences
  private static final String NOTIFICATION_STORE_ID = "NOTIFICATION_STORE";

  // Key used to save action types
  private static final String ACTION_TYPES_ID = "ACTION_TYPE_STORE";

  private static final String ID_KEY = "notificationIds";

  private Context context;

  public NotificationStorage(Context context) {
    this.context = context;
  }

  /**
   * Persist the id of currently scheduled notification
   */
  public void appendNotificationIds(List<LocalNotification> localNotifications) {
    SharedPreferences storage = getStorage(NOTIFICATION_STORE_ID);
    SharedPreferences.Editor editor = storage.edit();
    long creationTime = new Date().getTime();
    for (LocalNotification request : localNotifications) {
      String key = request.getId().toString();
      editor.putLong(key, creationTime);
    }
    editor.apply();
  }

  public List<String> getSavedNotificationIds() {
    SharedPreferences storage = getStorage(NOTIFICATION_STORE_ID);
    Map<String, ?> all = storage.getAll();
    if (all != null) {
      return new ArrayList<>(all.keySet());
    }
    return new ArrayList<>();
  }

  /**
   * Remove the stored notifications
   */
  public void deleteNotification(String id) {
    SharedPreferences.Editor editor = getStorage(NOTIFICATION_STORE_ID).edit();
    editor.remove(id);
    editor.apply();
  }

  /**
   * Shared private preferences for the application.
   */
  private SharedPreferences getStorage(String key) {
    return context.getSharedPreferences(key, Context.MODE_PRIVATE);
  }


  /**
   * Writes new action types (actions that being displayed in notification) to storage.
   * Write will override previous data.
   *
   * @param typesMap - map with groupId and actionArray assigned to group
   */
  public void writeActionGroup(Map<String, NotificationAction[]> typesMap) {
    Set<String> typesIds = typesMap.keySet();
    for (String id : typesIds) {
      SharedPreferences.Editor editor = getStorage(ACTION_TYPES_ID + id).edit();
      editor.clear();
      NotificationAction[] notificationActions = typesMap.get(id);
      editor.putInt("count", notificationActions.length);
      for (int i = 0; i < notificationActions.length; i++) {
        editor.putString("id" + i, notificationActions[i].getId());
        editor.putString("title" + i, notificationActions[i].getTitle());
        editor.putBoolean("input" + i, notificationActions[i].isInput());
      }
      editor.apply();
    }
  }

  /**
   * Retrieve array of notification actions per ActionTypeId
   *
   * @param forId - id of the group
   */
  public NotificationAction[] getActionGroup(String forId) {
    SharedPreferences storage = getStorage(ACTION_TYPES_ID + forId);
    int count = storage.getInt("count", 0);
    NotificationAction[] actions = new NotificationAction[count];
    for (int i = 0; i < count; i++) {
      String id = storage.getString("id" + i, "");
      String title = storage.getString("title" + i, "");
      Boolean input = storage.getBoolean("input" + i, false);
      actions[i] = new NotificationAction(id, title, input);
    }
    return actions;
  }

}
