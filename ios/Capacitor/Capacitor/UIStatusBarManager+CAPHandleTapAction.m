#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000

#import <Capacitor/Capacitor-Swift.h>

@implementation UIStatusBarManager (CAPHandleTapAction)

-(void)handleTapAction:(id)arg1 {
  [[NSNotificationCenter defaultCenter] postNotification:CAPBridge.statusBarTappedNotification];
}

@end

#endif
