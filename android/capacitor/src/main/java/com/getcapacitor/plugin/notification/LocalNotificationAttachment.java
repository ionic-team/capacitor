package com.getcapacitor.plugin.notification;

import com.getcapacitor.JSObject;

import org.json.JSONArray;
import org.json.JSONException;
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
    JSONArray attachments = null;
    try {
      attachments = notification.getJSONArray("attachments");
    } catch (Exception e) {
    }
    if (attachments != null) {
      for (int i = 0; i < attachments.length(); i++) {
        LocalNotificationAttachment newAttachment = new LocalNotificationAttachment();
        JSONObject jsonObject = null;
        try {
          jsonObject = attachments.getJSONObject(i);
        } catch (JSONException e) {
        }
        if (jsonObject != null) {
          JSObject jsObject = null;
          try {
            jsObject = JSObject.fromJSONObject(jsonObject);
          } catch (JSONException e) {
          }
          newAttachment.setId(jsObject.getString("id"));
          newAttachment.setUrl(jsObject.getString("url"));
          try {
            newAttachment.setOptions(jsObject.getJSONObject("options"));
          } catch (JSONException e) {
          }
          attachmentsList.add(newAttachment);
        }
      }
    }

    return attachmentsList;
  }
}