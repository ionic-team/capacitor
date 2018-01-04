#import <Foundation/Foundation.h>

#import "AVCBridgedPlugin.h"

AVC_PLUGIN(Accessibility,
  AVC_PLUGIN_METHOD(isScreenReaderEnabled, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(speak, AVCPluginReturnPromise);
)

AVC_PLUGIN(AppState,)

AVC_PLUGIN(Browser,
  AVC_PLUGIN_METHOD(open, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(close, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(prefetch, AVCPluginReturnPromise);
)

AVC_PLUGIN(Camera,
  AVC_PLUGIN_METHOD(getPhoto, AVCPluginReturnPromise);
)

AVC_PLUGIN(Clipboard,
  AVC_PLUGIN_METHOD(get, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(set, AVCPluginReturnPromise);
)

AVC_PLUGIN(Console,
  AVC_PLUGIN_METHOD(log, AVCPluginReturnNone);
)

AVC_PLUGIN(Device,
  AVC_PLUGIN_METHOD(getInfo, AVCPluginReturnPromise);
)

AVC_PLUGIN(Filesystem,
  AVC_PLUGIN_METHOD(readFile, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(writeFile, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(appendFile, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(deleteFile, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(mkdir, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(rmdir, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(readdir, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(stat, AVCPluginReturnPromise);
)

AVC_PLUGIN(Geolocation,
  AVC_PLUGIN_METHOD(getCurrentPosition, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(watchPosition, AVCPluginReturnCallback);
)

AVC_PLUGIN(Haptics,
  AVC_PLUGIN_METHOD(impact, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(selectionStart, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(selectionChanged, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(selectionEnd, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(vibrate, AVCPluginReturnPromise);
)

AVC_PLUGIN(AVCKeyboard,
  AVC_PLUGIN_METHOD(show, AVCPluginReturnPromise);
)

AVC_PLUGIN(LocalNotifications,
  AVC_PLUGIN_METHOD(schedule, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(cancel, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(getPending, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(registerActionTypes, AVCPluginReturnPromise);
)

AVC_PLUGIN(Modals,
  AVC_PLUGIN_METHOD(alert, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(prompt, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(confirm, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(showActions, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(showSharing, AVCPluginReturnPromise);
)

AVC_PLUGIN(Network,
  AVC_PLUGIN_METHOD(getStatus, AVCPluginReturnPromise);
)

AVC_PLUGIN(Photos,
  AVC_PLUGIN_METHOD(getPhotos, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(getAlbums, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(createAlbum, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(savePhoto, AVCPluginReturnPromise);
)

AVC_PLUGIN(SplashScreen,
  AVC_PLUGIN_METHOD(show, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(hide, AVCPluginReturnPromise);
)

AVC_PLUGIN(StatusBar,
  AVC_PLUGIN_METHOD(setStyle, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(show, AVCPluginReturnPromise);
  AVC_PLUGIN_METHOD(hide, AVCPluginReturnPromise);
)

