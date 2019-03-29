package com.getcapacitor.plugin;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
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
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.RemoteMessage;

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

  public static Bridge staticBridge = null;
  public static RemoteMessage lastMessage = null;
  public NotificationManager notificationManager;


  private static final String EVENT_TOKEN_CHANGE = "registration";

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
    if(bundle != null && bundle.containsKey("google.message_id")) {
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
    FirebaseInstanceId.getInstance().getInstanceId().addOnSuccessListener(getActivity(),  new OnSuccessListener<InstanceIdResult>() {
      @Override
      public void onSuccess(InstanceIdResult instanceIdResult) {
        sendToken(instanceIdResult.getToken());
      }
    });
    call.success();
  }

  @PluginMethod()
  public void getDeliveredNotifications(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void removeDeliveredNotifications(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void removeAllDeliveredNotifications(PluginCall call) {
    notificationManager.cancelAll();
    call.success();
  }

  @PluginMethod()
  public void createChannel(PluginCall call) {
    if (android.os.Build.VERSION.SDK_INT  >= android.os.Build.VERSION_CODES.O) {
      JSObject channel = new JSObject();
      channel.put(CHANNEL_ID, call.getString(CHANNEL_ID));
      channel.put(CHANNEL_NAME, call.getString(CHANNEL_NAME));
      channel.put(CHANNEL_DESCRIPTION, call.getString(CHANNEL_DESCRIPTION, ""));
      channel.put(CHANNEL_VISIBILITY,  call.getInt(CHANNEL_VISIBILITY, NotificationCompat.VISIBILITY_PUBLIC));
      channel.put(CHANNEL_IMPORTANCE, call.getInt(CHANNEL_IMPORTANCE));
      createChannel(channel);
      call.success();
    } else {
      call.unavailable();
    }
  }

  @PluginMethod()
  public void deleteChannel(PluginCall call) {
    if (android.os.Build.VERSION.SDK_INT  >= android.os.Build.VERSION_CODES.O) {
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
      notificationManager.createNotificationChannel(notificationChannelChannel);
    }
  }

  public void sendToken(String token) {
    JSObject data = new JSObject();
    data.put("value", token);
    notifyListeners(EVENT_TOKEN_CHANGE, data, true);
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
