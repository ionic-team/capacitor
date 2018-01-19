#import <Foundation/Foundation.h>

#import "CAPBridgedPlugin.h"

CAP_PLUGIN(Accessibility,
  CAP_PLUGIN_METHOD(isScreenReaderEnabled, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(speak, CAPPluginReturnPromise);
)

CAP_PLUGIN(App,
  CAP_PLUGIN_METHOD(getLaunchUrl, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(canOpenUrl, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(openUrl, CAPPluginReturnPromise);
)

CAP_PLUGIN(Browser,
  CAP_PLUGIN_METHOD(open, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(close, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(prefetch, CAPPluginReturnPromise);
)

CAP_PLUGIN(Camera,
  CAP_PLUGIN_METHOD(getPhoto, CAPPluginReturnPromise);
)

CAP_PLUGIN(Clipboard,
  CAP_PLUGIN_METHOD(get, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(set, CAPPluginReturnPromise);
)

CAP_PLUGIN(Console,
  CAP_PLUGIN_METHOD(log, CAPPluginReturnNone);
)

CAP_PLUGIN(Device,
  CAP_PLUGIN_METHOD(getInfo, CAPPluginReturnPromise);
)

CAP_PLUGIN(Filesystem,
  CAP_PLUGIN_METHOD(readFile, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(writeFile, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(appendFile, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(deleteFile, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(mkdir, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(rmdir, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(readdir, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(stat, CAPPluginReturnPromise);
)

CAP_PLUGIN(Geolocation,
  CAP_PLUGIN_METHOD(getCurrentPosition, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(watchPosition, CAPPluginReturnCallback);
  CAP_PLUGIN_METHOD(clearWatch, CAPPluginReturnPromise);
)

CAP_PLUGIN(Haptics,
  CAP_PLUGIN_METHOD(impact, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(selectionStart, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(selectionChanged, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(selectionEnd, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(vibrate, CAPPluginReturnPromise);
)

CAP_PLUGIN(CAPKeyboard,
  CAP_PLUGIN_METHOD(show, CAPPluginReturnPromise);
)

CAP_PLUGIN(LocalNotifications,
  CAP_PLUGIN_METHOD(schedule, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(cancel, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getPending, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(registerActionTypes, CAPPluginReturnPromise);
)

CAP_PLUGIN(Modals,
  CAP_PLUGIN_METHOD(alert, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(prompt, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(confirm, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(showActions, CAPPluginReturnPromise);
)

CAP_PLUGIN(Network,
  CAP_PLUGIN_METHOD(getStatus, CAPPluginReturnPromise);
)

CAP_PLUGIN(Photos,
  CAP_PLUGIN_METHOD(getPhotos, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getAlbums, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(createAlbum, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(savePhoto, CAPPluginReturnPromise);
)

CAP_PLUGIN(Share,
  CAP_PLUGIN_METHOD(share, CAPPluginReturnPromise);
)

CAP_PLUGIN(SplashScreen,
  CAP_PLUGIN_METHOD(show, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(hide, CAPPluginReturnPromise);
)

CAP_PLUGIN(StatusBar,
  CAP_PLUGIN_METHOD(setStyle, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(show, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(hide, CAPPluginReturnPromise);
)

