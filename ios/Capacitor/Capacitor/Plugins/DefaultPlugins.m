#import <Foundation/Foundation.h>

#import "CAPBridgedPlugin.h"

CAP_PLUGIN(CAPConsolePlugin, "Console",
  CAP_PLUGIN_METHOD(log, CAPPluginReturnNone);
)

CAP_PLUGIN(CAPLocalNotificationsPlugin, "LocalNotifications",
  CAP_PLUGIN_METHOD(schedule, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(requestPermission, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(cancel, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getPending, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(registerActionTypes, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(areEnabled, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(createChannel, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(deleteChannel, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(listChannels, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(removeAllListeners, CAPPluginReturnNone);
)

CAP_PLUGIN(CAPPushNotificationsPlugin, "PushNotifications",
  CAP_PLUGIN_METHOD(register, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(requestPermission, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getDeliveredNotifications, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(removeDeliveredNotifications, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(removeAllDeliveredNotifications, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(createChannel, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(deleteChannel, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(listChannels, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(removeAllListeners, CAPPluginReturnNone);
)

CAP_PLUGIN(CAPSplashScreenPlugin, "SplashScreen",
  CAP_PLUGIN_METHOD(show, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(hide, CAPPluginReturnPromise);
)

CAP_PLUGIN(CAPWebViewPlugin, "WebView",
  CAP_PLUGIN_METHOD(setServerBasePath, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getServerBasePath, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(persistServerBasePath, CAPPluginReturnPromise);
)
