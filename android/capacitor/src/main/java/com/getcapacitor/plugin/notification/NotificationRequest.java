package com.getcapacitor.plugin.notification;

import android.content.Context;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.plugin.util.AssetUtil;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;


/**
 * Local notification object mapped from json plugin
 */
public class NotificationRequest {

  // Default icon path
  private static final String DEFAULT_ICON = "res://icon";

  private String title;
  private String body;
  private Integer id;
  private LocalNotificationSchedule schedule;
  private String sound;
  private LocalNotificationAttachment[] attachments;
  private String actionTypeId;
  private JSObject extra;

  // Unparsed object
  private JSObject source;

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

  public LocalNotificationAttachment[] getAttachments() {
    return attachments;
  }

  public void setAttachments(LocalNotificationAttachment[] attachments) {
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
  public static List<NotificationRequest> buildNotificationList(PluginCall call) {
    JSArray notificationArray = call.getArray("notifications");
    if (notificationArray == null) {
      call.error("Must provide notifications array as notifications option");
      return null;
    }
    List<NotificationRequest> resultNotificationRequests = new ArrayList<>(notificationArray.length());
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
      NotificationRequest activeNotificationRequest = new NotificationRequest();
      activeNotificationRequest.setSource(notification);
      activeNotificationRequest.setId(notification.getInteger("id"));
      activeNotificationRequest.setBody(notification.getString("body"));
      activeNotificationRequest.setActionTypeId(notification.getString("actionTypeId"));
      activeNotificationRequest.setSound(notification.getString("sound"));
      activeNotificationRequest.setTitle(notification.getString("title"));
      try {
        activeNotificationRequest.setSchedule(new LocalNotificationSchedule(notification));
      } catch (ParseException e) {
        call.error("Invalid date format sent to Notification plugin", e);
        return null;
      }
      activeNotificationRequest.setExtra(notification.getJSObject("extra"));
      resultNotificationRequests.add(activeNotificationRequest);
    }
    return resultNotificationRequests;
  }

  public int getSmallIcon(Context context) {
    // TODO support custom icons in JS schema
    int resId = AssetUtil.getInstance(context).getResId(DEFAULT_ICON);

    if (resId == 0) {
      resId = android.R.drawable.ic_dialog_alert;
    }

    return resId;
  }

  public boolean isScheduled() {
    return this.schedule != null;
  }

  public void setSource(JSObject source) {
    this.source = source;
  }

  public JSObject getSource() {
    return source;
  }
}
