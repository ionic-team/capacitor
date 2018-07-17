package com.getcapacitor.plugin.notification;

import android.util.Log;

import com.getcapacitor.JSObject;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class LocalNotificationAttachment {
  private String id;
  private String url;
  private JSONObject options;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public JSONObject getOptions() {
    return options;
  }

  public void setOptions(JSONObject options) {
    this.options = options;
  }

  public static List<LocalNotificationAttachment> getAttachments(JSObject notification) {
    List<LocalNotificationAttachment> attachmentsList = new ArrayList<>();
    try {
      JSONArray attachments = notification.getJSONArray("attachments");
      if (attachments != null) {
        for (int i = 0; i < attachments.length(); i++) {
          LocalNotificationAttachment newAttachment = new LocalNotificationAttachment();
          JSONObject jsonObject = attachments.getJSONObject(i);
          if (jsonObject != null) {
            JSObject jsObject = JSObject.fromJSONObject(jsonObject);
            newAttachment.setId(jsObject.getString("id"));
            newAttachment.setUrl(jsObject.getString("url"));
            newAttachment.setOptions(jsObject.getJSONObject("options"));
            attachmentsList.add(newAttachment);
          }
        }
      }
    } catch (Exception e) {
      Log.e("LNAttachment", "Error when parsing attachments", e);
    }
    return attachmentsList;
  }
}