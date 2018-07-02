package com.getcapacitor.plugin.notification;

import android.content.Context;

import com.getcapacitor.JSArray;
import com.getcapacitor.PluginCall;
import com.getcapacitor.plugin.notification.util.AssetUtil;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import static com.getcapacitor.plugin.common.JsonParserUtils.getInt;
import static com.getcapacitor.plugin.common.JsonParserUtils.getString;

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
  private JSONObject extra;

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

  public JSONObject getExtra() {
    return extra;
  }

  public void setExtra(JSONObject extra) {
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
    List<NotificationRequest> resultNotificationRequests = new ArrayList<NotificationRequest>(notificationArray.length());
    List<JSONObject> notificationsJson = null;
    try {
      notificationsJson = notificationArray.toList();
    } catch (JSONException e) {
      call.error("Provided notification format is invalid");
      return null;
    }
    for (JSONObject jsonNotification : notificationsJson) {
      NotificationRequest activeNotificationRequest = new NotificationRequest();
      activeNotificationRequest.setId(getInt("id", jsonNotification));
      activeNotificationRequest.setBody(getString("body", jsonNotification));
      activeNotificationRequest.setActionTypeId(getString("actionTypeId", jsonNotification));
      activeNotificationRequest.setSound(getString("sound", jsonNotification));
      activeNotificationRequest.setTitle(getString("title", jsonNotification));
      try {
        activeNotificationRequest.setSchedule(new LocalNotificationSchedule(jsonNotification));
      } catch (ParseException e) {
        call.error("Invalid date format sent to Notification plugin");
        return null;
      }
      // TODO attachment support
      // activeNotificationRequest.setAttachments();
      try {
        activeNotificationRequest.setExtra(jsonNotification.getJSONObject("extra"));
      } catch (JSONException e) {
      }
      resultNotificationRequests.add(activeNotificationRequest);
    }
    return resultNotificationRequests;
  }

  public int getSmallIcon(Context context) {
    // TODO support custom icons in JS schema
    int resId = AssetUtil.getInstance(context).getResId(DEFAULT_ICON);

    if (resId == 0) {
      resId = android.R.drawable.ic_popup_reminder;
    }

    return resId;
  }

  public boolean isScheduled() {
    return this.schedule != null;
  }
}
