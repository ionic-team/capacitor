package com.getcapacitor.plugin.notification;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;

import com.getcapacitor.Config;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
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
public class LocalNotification {

  private String title;
  private String body;
  private Integer id;
  private String sound;
  private String smallIcon;
  private String iconColor;
  private String actionTypeId;
  private String group;
  private boolean groupSummary;
  private boolean ongoing;
  private boolean autoCancel;
  private JSObject extra;
  private List<LocalNotificationAttachment> attachments;
  private LocalNotificationSchedule schedule;
  private String channelId;

  private String source;

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

  public String getSound(Context context, int defaultSound) {
    String soundPath = null;
    int resId = AssetUtil.RESOURCE_ID_ZERO_VALUE;
    String name = AssetUtil.getResourceBaseName(sound);
    if (name != null) {
      resId = AssetUtil.getResourceID(context, name, "raw");
    }
    if (resId == AssetUtil.RESOURCE_ID_ZERO_VALUE) {
      resId = defaultSound;
    }
    if(resId != AssetUtil.RESOURCE_ID_ZERO_VALUE){
      soundPath = ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + context.getPackageName() + "/" + resId;
    }
    return soundPath;
  }

  public void setSound(String sound) {
    this.sound = sound;
  }

  public void setSmallIcon(String smallIcon) { this.smallIcon = AssetUtil.getResourceBaseName(smallIcon); }

  public String getIconColor(String globalColor) {
    // use the one defined local before trying for a globally defined color
    if (iconColor != null) {
      return iconColor;
    } 

    if (globalColor != null) {
      return globalColor;
    }

    return null;
  }

  public void setIconColor(String iconColor) {
    this.iconColor = iconColor;
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

  public String getGroup() {
    return group;
  }

  public void setGroup(String group) {
    this.group = group;
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

  public boolean isGroupSummary() {
    return groupSummary;
  }

  public void setGroupSummary(boolean groupSummary) {
    this.groupSummary = groupSummary;
  }

  public boolean isOngoing() {
    return ongoing;
  }

  public void setOngoing(boolean ongoing) {
    this.ongoing = ongoing;
  }

  public boolean isAutoCancel() {
    return autoCancel;
  }

  public void setAutoCancel(boolean autoCancel) {
    this.autoCancel = autoCancel;
  }

  public String getChannelId() {
    return channelId;
  }

  public void setChannelId(String channelId) {
    this.channelId = channelId;
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
      
      try {
          LocalNotification activeLocalNotification = buildNotificationFromJSObject(notification);
          resultLocalNotifications.add(activeLocalNotification);
      } catch (ParseException e) {
        call.error("Invalid date format sent to Notification plugin", e);
        return null;
      }
    }
    return resultLocalNotifications;
  }

  public static LocalNotification buildNotificationFromJSObject(JSObject jsonObject) throws ParseException {
      LocalNotification localNotification = new LocalNotification();
      localNotification.setSource(jsonObject.toString());
      localNotification.setId(jsonObject.getInteger("id"));
      localNotification.setBody(jsonObject.getString("body"));
      localNotification.setActionTypeId(jsonObject.getString("actionTypeId"));
      localNotification.setGroup(jsonObject.getString("group"));
      localNotification.setSound(jsonObject.getString("sound"));
      localNotification.setTitle(jsonObject.getString("title"));
      localNotification.setSmallIcon(jsonObject.getString("smallIcon"));
      localNotification.setIconColor(jsonObject.getString("iconColor"));
      localNotification.setAttachments(LocalNotificationAttachment.getAttachments(jsonObject));
      localNotification.setGroupSummary(jsonObject.getBoolean("groupSummary", false));
      localNotification.setChannelId(jsonObject.getString("channelId"));
      localNotification.setSchedule(new LocalNotificationSchedule(jsonObject));
      localNotification.setExtra(jsonObject.getJSObject("extra"));
      localNotification.setOngoing(jsonObject.getBoolean("ongoing", false));
      localNotification.setAutoCancel(jsonObject.getBoolean("autoCancel", true));

      return localNotification;
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

  public int getSmallIcon(Context context, int defaultIcon) {
    int resId = AssetUtil.RESOURCE_ID_ZERO_VALUE;

    if(smallIcon != null){
      resId = AssetUtil.getResourceID(context, smallIcon,"drawable");
    }

    if(resId == AssetUtil.RESOURCE_ID_ZERO_VALUE){
      resId = defaultIcon;
    }

    return resId;
  }



  public boolean isScheduled() {
    return this.schedule != null &&
            (this.schedule.getOn() != null ||
                    this.schedule.getAt() != null ||
                    this.schedule.getEvery() != null);
  }

  @Override
  public String toString() {
    return "LocalNotification{" +
            "title='" + title + '\'' +
            ", body='" + body + '\'' +
            ", id=" + id +
            ", sound='" + sound + '\'' +
            ", smallIcon='" + smallIcon + '\'' +
            ", iconColor='" + iconColor + '\'' +
            ", actionTypeId='" + actionTypeId + '\'' +
            ", group='" + group + '\'' +
            ", extra=" + extra +
            ", attachments=" + attachments +
            ", schedule=" + schedule +
            ", groupSummary=" + groupSummary +
            ", ongoing=" + ongoing +
            ", autoCancel=" + autoCancel +
            '}';
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    LocalNotification that = (LocalNotification) o;

    if (title != null ? !title.equals(that.title) : that.title != null) return false;
    if (body != null ? !body.equals(that.body) : that.body != null) return false;
    if (id != null ? !id.equals(that.id) : that.id != null) return false;
    if (sound != null ? !sound.equals(that.sound) : that.sound != null) return false;
    if (smallIcon != null ? !smallIcon.equals(that.smallIcon) : that.smallIcon != null) return false;
    if (iconColor != null ? !iconColor.equals(that.iconColor) : that.iconColor != null) return false;
    if (actionTypeId != null ? !actionTypeId.equals(that.actionTypeId) : that.actionTypeId != null)
      return false;
    if (group != null ? !group.equals(that.group) : that.group != null) return false;
    if (extra != null ? !extra.equals(that.extra) : that.extra != null) return false;
    if (attachments != null ? !attachments.equals(that.attachments) : that.attachments != null)
      return false;
    if (groupSummary != that.groupSummary) return false;
    if( ongoing != that.ongoing ) return false;
    if( autoCancel != that.autoCancel ) return false;
    return schedule != null ? schedule.equals(that.schedule) : that.schedule == null;
  }

  @Override
  public int hashCode() {
    int result = title != null ? title.hashCode() : 0;
    result = 31 * result + (body != null ? body.hashCode() : 0);
    result = 31 * result + (id != null ? id.hashCode() : 0);
    result = 31 * result + (sound != null ? sound.hashCode() : 0);
    result = 31 * result + (smallIcon != null ? smallIcon.hashCode() : 0);
    result = 31 * result + (iconColor != null ? iconColor.hashCode() : 0);
    result = 31 * result + (actionTypeId != null ? actionTypeId.hashCode() : 0);
    result = 31 * result + (group != null ? group.hashCode() : 0);
    result = 31 * result + Boolean.hashCode(groupSummary);
    result = 31 * result + Boolean.hashCode( ongoing );
    result = 31 * result + Boolean.hashCode( autoCancel );
    result = 31 * result + (extra != null ? extra.hashCode() : 0);
    result = 31 * result + (attachments != null ? attachments.hashCode() : 0);
    result = 31 * result + (schedule != null ? schedule.hashCode() : 0);
    return result;
  }


  public void setExtraFromString(String extraFromString) {
    try {
      JSONObject jsonObject = new JSONObject(extraFromString);
      this.extra = JSObject.fromJSONObject(jsonObject);
    } catch (JSONException e) {
      Logger.error(Logger.tags("LN"), "Cannot rebuild extra data", e);
    }
  }

  public String getSource() {
    return source;
  }

  public void setSource(String source) {
    this.source = source;
  }

}
