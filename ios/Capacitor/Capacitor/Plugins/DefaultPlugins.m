#import <Foundation/Foundation.h>

#import "CAPBridgedPlugin.h"

CAP_PLUGIN(CAPConsolePlugin, "Console",
  CAP_PLUGIN_METHOD(log, CAPPluginReturnNone);
)

CAP_PLUGIN(CAPHttpPlugin, "CapacitorHttp",
  CAP_PLUGIN_METHOD(request, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(get, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(post, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(put, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(patch, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(delete, CAPPluginReturnPromise);
)

CAP_PLUGIN(CAPWebViewPlugin, "WebView",
  CAP_PLUGIN_METHOD(setServerBasePath, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getServerBasePath, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(persistServerBasePath, CAPPluginReturnPromise);
)
