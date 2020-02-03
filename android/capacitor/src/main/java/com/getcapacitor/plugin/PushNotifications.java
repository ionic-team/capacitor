package com.getcapacitor.plugin;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.StatusBarNotification;
import android.support.v4.app.NotificationCompat;
import android.net.Uri;


import android.util.Log;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.PluginMethod;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@NativePlugin()
public class PushNotifications extends Plugin {

  public static String CHANNEL_ID = "id";
  public static String CHANNEL_NAME = "name";
  public static String CHANNEL_DESCRIPTION = "description";
  public static String CHANNEL_IMPORTANCE = "importance";
  public static String CHANNEL_VISIBILITY = "visibility";
  public static String CHANNEL_SOUND = "sound";

  public static Bridge staticBridge = null;
  public static RemoteMessage lastMessage = null;
  public NotificationManager notificationManager;


  private static final String EVENT_TOKEN_CHANGE = "registration";
  private static final String EVENT_TOKEN_ERROR = "registrationError";

  public void load() {
    notificationManager = (NotificationManager)getActivity()
            .getSystemService(Context.NOTIFICATION_SERVICE);
    staticBridge = this.bridge;
    if (lastMessage != null) {
      fireNotification(lastMessage);
      lastMessage = null;
    }
  }

  @Override
  protected void handleOnNewIntent(Intent data) {
    super.handleOnNewIntent(data);
    Bundle bundle = data.getExtras();
    if (bundle != null && bundle.containsKey("google.message_id")) {
      JSObject notificationJson = new JSObject();
      JSObject dataObject = new JSObject();
      for (String key : bundle.keySet()) {
        if (key.equals("google.message_id")) {
          notificationJson.put("id", bundle.get(key));
        } else {
          Object value = bundle.get(key);
          String valueStr = (value != null) ? value.toString() : null;
          dataObject.put(key, valueStr);
        }
      }
      notificationJson.put("data", dataObject);
      JSObject actionJson = new JSObject();
      actionJson.put("actionId", "tap");
      actionJson.put("notification", notificationJson);
      notifyListeners("pushNotificationActionPerformed", actionJson, true);
    }
  }

  @PluginMethod()
  public void register(PluginCall call) {
    FirebaseMessaging.getInstance().setAutoInitEnabled(true);
    FirebaseInstanceId.getInstance().getInstanceId().addOnSuccessListener(getActivity(), new OnSuccessListener<InstanceIdResult>() {
      @Override
      public void onSuccess(InstanceIdResult instanceIdResult) {
        sendToken(instanceIdResult.getToken());
      }
    });
    FirebaseInstanceId.getInstance().getInstanceId().addOnFailureListener(new OnFailureListener() {
      public void onFailure(Exception e) {
        sendError(e.getLocalizedMessage());
      }
    });
    call.success();
  }

  @PluginMethod()
  public void getDeliveredNotifications(PluginCall call) {
    JSArray notifications = new JSArray();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      StatusBarNotification[] activeNotifications = notificationManager.getActiveNotifications();

      for (StatusBarNotification notif : activeNotifications) {
        JSObject jsNotif = new JSObject();

        jsNotif.put("id", notif.getId());

        Notification notification = notif.getNotification();
        if (notification != null) {
          jsNotif.put("title", notification.extras.getCharSequence(Notification.EXTRA_TITLE));
          jsNotif.put("body", notification.extras.getCharSequence(Notification.EXTRA_TEXT));
          jsNotif.put("group", notification.getGroup());
          jsNotif.put("groupSummary", 0 != (notification.flags & Notification.FLAG_GROUP_SUMMARY));

          JSObject extras = new JSObject();

          for (String key : notification.extras.keySet()) {
            extras.put(key, notification.extras.get(key));
          }

          jsNotif.put("data", extras);
        }

        notifications.put(jsNotif);
      }
    }

    JSObject result = new JSObject();
    result.put("notifications", notifications);
    call.resolve(result);
  }

  @PluginMethod()
  public void removeDeliveredNotifications(PluginCall call) {
    JSArray notifications = call.getArray("notifications");

    List<Integer> ids = new ArrayList<>();
    try {
      for (Object o : notifications.toList()) {
        if (o instanceof JSONObject) {
          JSObject notif = JSObject.fromJSONObject((JSONObject) o);
          Integer id = notif.getInteger("id");
          ids.add(id);
        } else {
          call.reject("Expected notifications to be a list of notification objects");
        }
      }
    } catch (JSONException e) {
      call.reject(e.getMessage());
    }

    for (int id : ids) {
      notificationManager.cancel(id);
    }

    call.resolve();
  }

  @PluginMethod()
  public void removeAllDeliveredNotifications(PluginCall call) {
    notificationManager.cancelAll();
    call.success();
  }

  @PluginMethod()
  public void createChannel(PluginCall call) {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      JSObject channel = new JSObject();
      channel.put(CHANNEL_ID, call.getString(CHANNEL_ID));
      channel.put(CHANNEL_NAME, call.getString(CHANNEL_NAME));
      channel.put(CHANNEL_DESCRIPTION, call.getString(CHANNEL_DESCRIPTION, ""));
      channel.put(CHANNEL_VISIBILITY, call.getInt(CHANNEL_VISIBILITY, NotificationCompat.VISIBILITY_PUBLIC));
      channel.put(CHANNEL_IMPORTANCE, call.getInt(CHANNEL_IMPORTANCE));
      channel.put(CHANNEL_SOUND, call.getString(CHANNEL_SOUND, null));
      createChannel(channel);
      call.success();
    } else {
      call.unavailable();
    }
  }

  @PluginMethod()
  public void deleteChannel(PluginCall call) {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      String channelId = call.getString("id");
      notificationManager.deleteNotificationChannel(channelId);
      call.success();
    } else {
      call.unavailable();
    }
  }

  @PluginMethod()
  public void listChannels(PluginCall call) {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      List<NotificationChannel> notificationChannels = notificationManager.getNotificationChannels();
      JSArray channels = new JSArray();
      for (NotificationChannel notificationChannel : notificationChannels) {
        JSObject channel = new JSObject();
        channel.put(CHANNEL_ID, notificationChannel.getId());
        channel.put(CHANNEL_NAME, notificationChannel.getName());
        channel.put(CHANNEL_DESCRIPTION, notificationChannel.getDescription());
        channel.put(CHANNEL_IMPORTANCE, notificationChannel.getImportance());
        channel.put(CHANNEL_VISIBILITY, notificationChannel.getLockscreenVisibility());
        channel.put(CHANNEL_SOUND, notificationChannel.getSound());
        Log.d(getLogTag(), "visibility " + notificationChannel.getLockscreenVisibility());
        Log.d(getLogTag(), "importance " + notificationChannel.getImportance());
        channels.put(channel);
      }
      JSObject result = new JSObject();
      result.put("channels", channels);
      call.success(result);
    } else {
      call.unavailable();
    }
  }

  private void createChannel(JSObject channel) {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      NotificationChannel notificationChannelChannel = new NotificationChannel(channel.getString(CHANNEL_ID), channel.getString(CHANNEL_NAME), channel.getInteger(CHANNEL_IMPORTANCE));
      notificationChannelChannel.setDescription(channel.getString(CHANNEL_DESCRIPTION, ""));
      notificationChannelChannel.setLockscreenVisibility(channel.getInteger(CHANNEL_VISIBILITY, 0));
      String sound = channel.getString(CHANNEL_SOUND, null);
      if (sound != null && !sound.isEmpty()) {
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM).build();
        Uri soundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getContext().getPackageName() + "/raw/" + sound);
        notificationChannelChannel.setSound(soundUri, audioAttributes);
      }
      notificationManager.createNotificationChannel(notificationChannelChannel);
    }
  }

  public void sendToken(String token) {
    JSObject data = new JSObject();
    data.put("value", token);
    notifyListeners(EVENT_TOKEN_CHANGE, data, true);
  }

  public void sendError(String error) {
    JSObject data = new JSObject();
    data.put("error", error);
    notifyListeners(EVENT_TOKEN_ERROR, data, true);
  }

  public static void onNewToken(String newToken) {
    PushNotifications pushPlugin = PushNotifications.getPushNotificationsInstance();
    if (pushPlugin != null) {
      pushPlugin.sendToken(newToken);
    }
  }

  public static void sendRemoteMessage(RemoteMessage remoteMessage) {
    PushNotifications pushPlugin = PushNotifications.getPushNotificationsInstance();
    if (pushPlugin != null) {
      pushPlugin.fireNotification(remoteMessage);
    } else {
      lastMessage = remoteMessage;
    }
  }

  public void fireNotification(RemoteMessage remoteMessage) {
    JSObject remoteMessageData = new JSObject();

    JSObject data = new JSObject();
    remoteMessageData.put("id", remoteMessage.getMessageId());
    for (String key : remoteMessage.getData().keySet()) {
      Object value = remoteMessage.getData().get(key);
      data.put(key, value);
    }
    remoteMessageData.put("data", data);

    RemoteMessage.Notification notification = remoteMessage.getNotification();
    if (notification != null) {
      remoteMessageData.put("title", notification.getTitle());
      remoteMessageData.put("body", notification.getBody());
      remoteMessageData.put("click_action", notification.getClickAction());

      Uri link = notification.getLink();
      if (link != null) {
        remoteMessageData.put("link", link.toString());
      }
    }

    notifyListeners("pushNotificationReceived", remoteMessageData, true);
  }

  public static PushNotifications getPushNotificationsInstance() {
    if (staticBridge != null && staticBridge.getWebView() != null) {
      PluginHandle handle = staticBridge.getPlugin("PushNotifications");
      if (handle == null) {
        return null;
      }
      return (PushNotifications) handle.getInstance();
    }
    return null;
  }

}
