#import <objc/runtime.h>
#import <Capacitor/Capacitor-Swift.h>

// Swift extensions marked as @objc and internal are available to the runtime but won't be found at compile time
// so we need this declaration to avoid compiler complaints.
@interface WKWebView (InternalSwiftExtension)
+ (void)_swizzleKeyboardMethods;
@end

// +load is the safest place to swizzle methods but that won't work from a swift extension so we need this wrapper.
@implementation WKWebView (CapacitorAutoFocus)
+ (void)load {
    [self _swizzleKeyboardMethods];
}
@end
