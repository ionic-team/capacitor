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

// TODO: Remove this after Xcode 14.3 is required
@implementation WKWebView (CapacitorInspectablity)

- (void)setInspectableIfRequired: (BOOL)shouldInspect {
    #if __IPHONE_OS_VERSION_MAX_ALLOWED >= 160400
    if (@available(iOS 16.4, *)) {
        self.inspectable = shouldInspect;
    }
    #endif
}

@end
