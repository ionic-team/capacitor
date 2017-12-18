#import <Foundation/Foundation.h>

#import "AVCBridgedPlugin.h"

AVC_PLUGIN(Accessibility,
  AVC_PLUGIN_METHOD(isScreenReaderEnabled, "", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(speak, "value:string", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(onScreenReaderStateChange, "", AVCPluginReturnCallback);
)

AVC_PLUGIN(Browser,
  AVC_PLUGIN_METHOD(open, "url:string", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(close, "options:any", AVCPluginReturnPromise);
)

AVC_PLUGIN(Camera,
  AVC_PLUGIN_METHOD(getPhoto, "options:any", AVCPluginReturnPromise);
)

AVC_PLUGIN(Clipboard,
  AVC_PLUGIN_METHOD(get, "options:any", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(set, "options:any", AVCPluginReturnPromise);
)

AVC_PLUGIN(Console,
  AVC_PLUGIN_METHOD(log, "message:string,level?:string", AVCPluginReturnNone);
)

AVC_PLUGIN(Device,
  AVC_PLUGIN_METHOD(getInfo, "", AVCPluginReturnPromise);
)

AVC_PLUGIN(Filesystem,
  AVC_PLUGIN_METHOD(readFile, "file:string,directory:string,encoding:string", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(writeFile, "file:string,directory:string,data:string, encoding:string", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(appendFile, "file:string,directory:string,data:string,encoding:string", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(deleteFile, "file:string,directory:string", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(mkdir, "path:string,directory:string,createIntermediateDirectories:boolean", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(rmdir, "path:string,directory:string", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(readdir, "path:string,directory:string", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(stat, "path:string,directory:string", AVCPluginReturnPromise);
)

AVC_PLUGIN(Geolocation,
  AVC_PLUGIN_METHOD(getCurrentPosition, "options:any", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(watchPosition, "options:any", AVCPluginReturnCallback);
)

AVC_PLUGIN(Haptics,
  AVC_PLUGIN_METHOD(impact, "style:string", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(selectionStart, "", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(selectionChanged, "", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(selectionEnd, "", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(vibrate, "", AVCPluginReturnPromise);
)

AVC_PLUGIN(AVCKeyboard,
  AVC_PLUGIN_METHOD(show, "", AVCPluginReturnPromise);
)

AVC_PLUGIN(LocalNotifications,
  AVC_PLUGIN_METHOD(schedule, "", AVCPluginReturnPromise);
)

AVC_PLUGIN(Modals,
  AVC_PLUGIN_METHOD(alert, "", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(prompt, "", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(confirm, "", AVCPluginReturnPromise);
)

AVC_PLUGIN(Network,
  AVC_PLUGIN_METHOD(onStatusChange, "", AVCPluginReturnCallback);
  AVC_PLUGIN_METHOD(getStatus, "", AVCPluginReturnPromise);
)

AVC_PLUGIN(SplashScreen,
  AVC_PLUGIN_METHOD(show, "", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(hide, "", AVCPluginReturnPromise);
)

AVC_PLUGIN(StatusBar,
  AVC_PLUGIN_METHOD(setStyle, "", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(show, "", AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(hide, "", AVCPluginReturnPromise);
)

