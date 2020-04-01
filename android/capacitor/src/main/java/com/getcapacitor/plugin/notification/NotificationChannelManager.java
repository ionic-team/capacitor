package com.getcapacitor.plugin.notification;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.Context;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.net.Uri;
import android.util.Log;


import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import java.util.List;

public class NotificationChannelManager {

    private static final String TAG = "NotificationChannel: ";


    private static String CHANNEL_ID = "id";
    private static String CHANNEL_NAME = "name";
    private static String CHANNEL_DESCRIPTION = "description";
    private static String CHANNEL_IMPORTANCE = "importance";
    private static String CHANNEL_VISIBILITY = "visibility";
    private static String CHANNEL_SOUND = "sound";
    private static String CHANNEL_USE_LIGHTS = "lights";
    private static String CHANNEL_LIGHT_COLOR = "lightColor";


    public static void createChannel(PluginCall call, Context context, NotificationManager notificationManager) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            android.app.NotificationChannel notificationChannelChannel = new android.app.NotificationChannel(call.getString(CHANNEL_ID), call.getString(CHANNEL_NAME), call.getInt(CHANNEL_IMPORTANCE));
            notificationChannelChannel.setDescription(call.getString(CHANNEL_DESCRIPTION));
            notificationChannelChannel.setLockscreenVisibility(call.getInt(CHANNEL_VISIBILITY));
            notificationChannelChannel.enableLights(call.getBoolean(CHANNEL_USE_LIGHTS));
            String lightColor = call.getString(CHANNEL_LIGHT_COLOR);
            if (lightColor != null) {
                try {
                    notificationChannelChannel.setLightColor(Color.parseColor(lightColor));
                } catch (IllegalArgumentException ex) {
                    call.error("Invalid color provided for light color.", ex);
                }
            }
            String sound = call.getString(CHANNEL_SOUND, null);
            if (sound != null && !sound.isEmpty()) {
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM).build();
                Uri soundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + context.getPackageName() + "/raw/" + sound);
                notificationChannelChannel.setSound(soundUri, audioAttributes);
            }
            notificationManager.createNotificationChannel(notificationChannelChannel);
        }
    }

    public static void deleteChannel(PluginCall call, NotificationManager notificationManager) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            String channelId = call.getString("id");
            notificationManager.deleteNotificationChannel(channelId);
            call.success();
        } else {
            call.unavailable();
        }
    }

    public static void listChannel(PluginCall call, NotificationManager notificationManager) {
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
                channel.put(CHANNEL_USE_LIGHTS, notificationChannel.shouldShowLights());
                channel.put(CHANNEL_LIGHT_COLOR, String.format("#%06X", (0xFFFFFF & notificationChannel.getLightColor())));
                Log.d(TAG, "visibility " + notificationChannel.getLockscreenVisibility());
                Log.d(TAG, "importance " + notificationChannel.getImportance());
                channels.put(channel);
            }
            JSObject result = new JSObject();
            result.put("channels", channels);
            call.success(result);
        } else {
            call.unavailable();
        }
    }
}
