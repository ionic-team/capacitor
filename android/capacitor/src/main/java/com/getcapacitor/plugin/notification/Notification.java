package com.getcapacitor.plugin.notification;

import org.json.JSONObject;

/**
 * Local notification object mapped from json plugin
 */
public class Notification {
  private String title;
  private String body;
  private String id;
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

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
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
}
