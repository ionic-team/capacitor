#import <Foundation/Foundation.h>

#import "CAPBridgedPlugin.h"

CAP_PLUGIN(CAPConsolePlugin, "Console",
  CAP_PLUGIN_METHOD(log, CAPPluginReturnNone);
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
