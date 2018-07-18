package com.getcapacitor.plugin.notification;

import android.content.Context;
import android.support.annotation.NonNull;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;


/**
 * Local notification object mapped from json plugin
 */
public class LocalNotification {

  // Default icon path
  private static final String DEFAULT_ICON = "res://icon";

  private String title;
  private String body;
  private Integer id;
  private String sound;
  private String actionTypeId;
  private JSObject extra;
  private List<LocalNotificationAttachment> attachments;
  private LocalNotificationSchedule schedule;

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getBody() {
    return body;
  }

  public void setBody(String body) {
    this.body = body;
  }


  public LocalNotificationSchedule getSchedule() {
    return schedule;
  }

  public void setSchedule(LocalNotificationSchedule schedule) {
    this.schedule = schedule;
  }

  public String getSound() {
    return sound;
  }

  public void setSound(String sound) {
    this.sound = sound;
  }


  public List<LocalNotificationAttachment> getAttachments() {
    return attachments;
  }

  public void setAttachments(List<LocalNotificationAttachment> attachments) {
    this.attachments = attachments;
  }

  public String getActionTypeId() {
    return actionTypeId;
  }

  public void setActionTypeId(String actionTypeId) {
    this.actionTypeId = actionTypeId;
  }

  public JSObject getExtra() {
    return extra;
  }

  public void setExtra(JSObject extra) {
    this.extra = extra;
  }

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  /**
   * Build list of the notifications from remote plugin call
   */
  public static List<LocalNotification> buildNotificationList(PluginCall call) {
    JSArray notificationArray = call.getArray("notifications");
    if (notificationArray == null) {
      call.error("Must provide notifications array as notifications option");
      return null;
    }
    List<LocalNotification> resultLocalNotifications = new ArrayList<>(notificationArray.length());
    List<JSONObject> notificationsJson;
    try {
      notificationsJson = notificationArray.toList();
    } catch (JSONException e) {
      call.error("Provided notification format is invalid");
      return null;
    }

    for (JSONObject jsonNotification : notificationsJson) {
      JSObject notification = null;
      try {
        notification = JSObject.fromJSONObject(jsonNotification);
      } catch (JSONException e) {
        call.error("Invalid JSON object sent to NotificationPlugin", e);
        return null;
      }
      LocalNotification activeLocalNotification = new LocalNotification();
      activeLocalNotification.setId(notification.getInteger("id"));
      activeLocalNotification.setBody(notification.getString("body"));
      activeLocalNotification.setActionTypeId(notification.getString("actionTypeId"));
      activeLocalNotification.setSound(notification.getString("sound"));
      activeLocalNotification.setTitle(notification.getString("title"));
      activeLocalNotification.setAttachments(LocalNotificationAttachment.getAttachments(notification));
      try {
        activeLocalNotification.setSchedule(new LocalNotificationSchedule(notification));
      } catch (ParseException e) {
        call.error("Invalid date format sent to Notification plugin", e);
        return null;
      }
      activeLocalNotification.setExtra(notification.getJSObject("extra"));
      resultLocalNotifications.add(activeLocalNotification);
    }
    return resultLocalNotifications;
  }


  public static List<Integer> getLocalNotificationPendingList(PluginCall call) {
    List<JSONObject> notifications = null;
    try {
      notifications = call.getArray("notifications").toList();
    } catch (JSONException e) {
    }
    if (notifications == null || notifications.size() == 0) {
      call.error("Must provide notifications array as notifications option");
      return null;
    }
    List<Integer> notificationsList = new ArrayList<>(notifications.size());
    for (JSONObject notificationToCancel : notifications) {
      try {
        notificationsList.add(notificationToCancel.getInt("id"));
      } catch (JSONException e) {
      }
    }
    return notificationsList;
  }

  public static JSObject buildLocalNotificationPendingList(List<String> ids) {
    JSObject result = new JSObject();
    JSArray jsArray = new JSArray();
    for (String id : ids) {
      JSObject notification = new JSObject();
      notification.put("id", id);
      jsArray.put(notification);
    }
    result.put("notifications", jsArray);
    return result;
  }

  public int getSmallIcon(Context context) {
    // TODO support custom icons
    int resId = android.R.drawable.ic_dialog_info;
    return resId;
  }

  public boolean isScheduled() {
    return this.schedule != null;
  }

}
