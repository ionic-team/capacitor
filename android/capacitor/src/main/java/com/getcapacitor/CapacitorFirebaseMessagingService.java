package com.getcapacitor;

import com.getcapacitor.plugin.PushNotifications;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class CapacitorFirebaseMessagingService extends FirebaseMessagingService {

  @Override
  public void onNewToken(String newToken) {
    super.onNewToken(newToken);
    PushNotifications.onNewToken(newToken);
  }

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    super.onMessageReceived(remoteMessage);
    PushNotifications.sendRemoteMessage(remoteMessage);
  }

}